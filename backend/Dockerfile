# ---- Build stage ----
FROM golang:1.22 AS builder
WORKDIR /app

# 1️⃣ Copy module definitions first (cache dependencies)
COPY go.mod go.sum ./
RUN go mod download

# 2️⃣ Copy rest of the source
COPY . .

# 3️⃣ Verify / tidy modules
RUN go mod tidy

# 4️⃣ Build static binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server

# ---- Runtime stage ----
FROM alpine:latest
WORKDIR /root/

# 5️⃣ Certificates for HTTPS calls (e.g., Portainer)
RUN apk --no-cache add ca-certificates

# 6️⃣ Copy built binary
COPY --from=builder /app/server .

# 7️⃣ Expose port & health check
EXPOSE 8080
HEALTHCHECK CMD wget --spider -q localhost:8080 || exit 1

# 8️⃣ Run API
CMD ["./server"]
