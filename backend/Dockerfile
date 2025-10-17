# ---- Build stage ----
FROM golang:1.22 AS builder
WORKDIR /app

# Copy only module files first to leverage Docker layer caching
COPY go.mod go.sum ./
RUN go mod download

# Now copy the rest of the source code
COPY . .

# Double-check dependencies and tidy (optional but good practice)
RUN go mod tidy

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# ---- Runtime stage ----
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/server .
CMD ["./server"]