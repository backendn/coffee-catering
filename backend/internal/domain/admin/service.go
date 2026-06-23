package admin

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/backendn/coffee-catering/backend/db/sqlc"
	"github.com/backendn/coffee-catering/backend/internal/pkg/apperror"
)

const tokenTTL = 24 * time.Hour

type Service struct {
	repo      *Repository
	jwtSecret []byte
}

func NewService(repo *Repository, jwtSecret string) *Service {
	return &Service{repo: repo, jwtSecret: []byte(jwtSecret)}
}

// Login verifies username/password against the stored bcrypt hash and, on
// success, issues a signed JWT valid for 24h. A generic "invalid
// credentials" error is returned for both "user not found" and "wrong
// password" so the API doesn't leak which usernames exist.
func (s *Service) Login(ctx context.Context, req LoginRequest) (*LoginResponse, error) {
	user, err := s.repo.GetAdminUserByUsername(ctx, req.Username)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid_credentials", "invalid username or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, apperror.NewBadRequest("invalid_credentials", "invalid username or password")
	}

	token, err := s.issueToken(user)
	if err != nil {
		return nil, fmt.Errorf("issuing token: %w", err)
	}

	return &LoginResponse{
		Token: token,
		User: UserSummary{
			ID:       uuid.UUID(user.ID.Bytes).String(),
			Username: user.Username,
			FullName: user.FullName.String,
			Role:     user.Role,
		},
	}, nil
}

// CreateAdminUser is for bootstrapping the first admin account — intended
// to be run via a one-off script/seed, not exposed as a public HTTP route,
// since there's no existing admin to gate it behind yet.
func (s *Service) CreateAdminUser(ctx context.Context, username, password, fullName, role string) (*UserSummary, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hashing password: %w", err)
	}

	user, err := s.repo.CreateAdminUser(ctx, sqlc.CreateAdminUserParams{
		Username:     username,
		PasswordHash: string(hash),
		FullName:     pgtypeText(fullName),
		Role:         role,
	})
	if err != nil {
		return nil, fmt.Errorf("creating admin user: %w", err)
	}

	return &UserSummary{
		ID: uuid.UUID(user.ID.Bytes).String(), Username: user.Username,
		FullName: user.FullName.String, Role: user.Role,
	}, nil
}

func (s *Service) issueToken(user sqlc.AdminUser) (string, error) {
	claims := Claims{
		UserID:   uuid.UUID(user.ID.Bytes).String(),
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(tokenTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}
