// Package notification sends transactional emails via Resend's REST API
// (https://resend.com). Implemented as a direct HTTP call rather than
// pulling in Resend's Go SDK, since the API surface needed here (a single
// POST with from/to/subject/html) doesn't justify the extra dependency.
package notification

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const resendAPIURL = "https://api.resend.com/emails"

// Service implements order.Notifier (and similar interfaces other domains
// may define later) by sending email through Resend.
type Service struct {
	apiKey    string
	fromEmail string // e.g. "Coffee & Catering <orders@yourdomain.com>" — must be a Resend-verified sender
	client    *http.Client
}

func NewService(apiKey, fromEmail string) *Service {
	return &Service{
		apiKey:    apiKey,
		fromEmail: fromEmail,
		client:    &http.Client{Timeout: 10 * time.Second},
	}
}

type resendRequest struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Subject string `json:"subject"`
	HTML    string `json:"html"`
}

// SendOrderConfirmation notifies a customer their order was received.
// Satisfies the order.Notifier interface.
func (s *Service) SendOrderConfirmation(ctx context.Context, customerEmail, customerName, orderNumber string) error {
	html := renderOrderConfirmation(customerName, orderNumber)
	return s.send(ctx, customerEmail, fmt.Sprintf("Order Received — %s", orderNumber), html)
}

// SendStatusUpdate notifies a customer their order's status changed (e.g.
// "out for delivery"). Used by the order domain once status updates are
// wired to fire notifications too.
func (s *Service) SendStatusUpdate(ctx context.Context, customerEmail, customerName, orderNumber, newStatus string) error {
	html := renderStatusUpdate(customerName, orderNumber, newStatus)
	return s.send(ctx, customerEmail, fmt.Sprintf("Order Update — %s", orderNumber), html)
}

func (s *Service) send(ctx context.Context, to, subject, html string) error {
	if s.apiKey == "" {
		// No API key configured (e.g. local dev without Resend set up) —
		// log instead of failing, so order creation never blocks on email.
		fmt.Printf("[notification] RESEND_API_KEY not set, skipping email to %s: %s\n", to, subject)
		return nil
	}

	body, err := json.Marshal(resendRequest{
		From:    s.fromEmail,
		To:      to,
		Subject: subject,
		HTML:    html,
	})
	if err != nil {
		return fmt.Errorf("marshaling email payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, resendAPIURL, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("building request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("sending email via resend: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("resend api error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}