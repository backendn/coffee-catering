package notification

import "fmt"

// renderOrderConfirmation builds the confirmation email body. Kept as plain
// Go string formatting rather than html/template since there are only two
// short, fixed-shape emails right now — revisit with html/template if the
// template set grows or starts taking user-controlled HTML.
func renderOrderConfirmation(customerName, orderNumber string) string {
	return fmt.Sprintf(`
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
  <h2 style="color: #4b3621;">Thanks for your order, %s!</h2>
  <p>We've received your order and someone from our team will reach out shortly to confirm details and arrange payment.</p>
  <p style="background: #f5f0e8; padding: 12px 16px; border-radius: 6px;">
    <strong>Order reference:</strong> %s
  </p>
  <p>Keep this reference handy if you need to follow up with us.</p>
  <p style="color: #888; font-size: 13px; margin-top: 32px;">— Your Coffee & Catering Team</p>
</div>`, customerName, orderNumber)
}

// renderStatusUpdate builds the status-change email body.
func renderStatusUpdate(customerName, orderNumber, newStatus string) string {
	friendly := statusLabels[newStatus]
	if friendly == "" {
		friendly = newStatus
	}

	return fmt.Sprintf(`
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
  <h2 style="color: #4b3621;">Update on your order, %s</h2>
  <p style="background: #f5f0e8; padding: 12px 16px; border-radius: 6px;">
    <strong>Order %s</strong> is now: <strong>%s</strong>
  </p>
  <p style="color: #888; font-size: 13px; margin-top: 32px;">— Your Coffee & Catering Team</p>
</div>`, customerName, orderNumber, friendly)
}

// statusLabels maps internal status codes to customer-friendly wording.
var statusLabels = map[string]string{
	"pending":          "Received, pending confirmation",
	"confirmed":        "Confirmed",
	"preparing":        "Being prepared",
	"ready":            "Ready for pickup",
	"out_for_delivery": "Out for delivery",
	"completed":        "Completed",
	"cancelled":        "Cancelled",
}
