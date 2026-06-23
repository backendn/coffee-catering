package admin

import "github.com/jackc/pgx/v5/pgtype"

func pgtypeText(s string) pgtype.Text {
	return pgtype.Text{String: s, Valid: s != ""}
}