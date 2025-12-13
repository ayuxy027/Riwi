# Feedback Validation API

## Validate Feedback

**POST** `/api/feedback/validate`

### Request

```bash
curl -X POST http://localhost:3000/api/feedback/validate \
  -H "Content-Type: application/json" \
  -d '{"text": "Great restaurant with amazing pasta and friendly staff!"}'
```

### Response (Valid)

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "confidence": 0.95
  },
  "timestamp": "2025-12-13T06:00:00.000Z"
}
```

### Response (Invalid)

```json
{
  "success": true,
  "data": {
    "isValid": false,
    "reason": "Text does not reference a specific location",
    "confidence": 0.87
  },
  "timestamp": "2025-12-13T06:00:00.000Z"
}
```

### Response (Error)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Text field is required and must be a string"
  },
  "timestamp": "2025-12-13T06:00:00.000Z"
}
```
