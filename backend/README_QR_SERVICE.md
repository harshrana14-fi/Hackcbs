# QR Code Generation Service

This Python service generates QR codes for the AR Voting Badge feature.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the service:
```bash
python qr_service.py
```

The service will run on port 5001 by default.

## API Endpoints

### Generate QR Code
**POST** `/api/qr/generate`

Request body:
```json
{
  "voterId": "VC123456789012345",
  "electionId": "1",
  "transactionHash": "0x..."
}
```

Response:
```json
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "qrData": "voting-badge-ar://VC123456789012345/1/0x...",
  "timestamp": "2024-01-01T12:00:00"
}
```

### Verify QR Code
**POST** `/api/qr/verify`

Request body:
```json
{
  "qrData": "voting-badge-ar://VC123456789012345/1/0x..."
}
```

Response:
```json
{
  "success": true,
  "valid": true,
  "voterId": "VC123456789012345",
  "electionId": "1",
  "transactionHash": "0x..."
}
```

### Health Check
**GET** `/api/health`

Response:
```json
{
  "status": "healthy",
  "service": "QR Code Generation Service"
}
```

## Environment Variables

- `PORT`: Port number (default: 5001)

