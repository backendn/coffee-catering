package apperror

import "net/http"

// AppError is a standard error type carrying an HTTP status and a
// user-safe message, so handlers don't leak internal error details.
type AppError struct {
	Status  int    `json:"-"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (e *AppError) Error() string { return e.Message }

func NewBadRequest(code, message string) *AppError {
	return &AppError{Status: http.StatusBadRequest, Code: code, Message: message}
}

func NewNotFound(code, message string) *AppError {
	return &AppError{Status: http.StatusNotFound, Code: code, Message: message}
}

func NewConflict(code, message string) *AppError {
	return &AppError{Status: http.StatusConflict, Code: code, Message: message}
}

func NewInternal(code, message string) *AppError {
	return &AppError{Status: http.StatusInternalServerError, Code: code, Message: message}
}