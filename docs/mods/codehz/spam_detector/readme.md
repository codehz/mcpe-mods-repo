# Spam Detector

Config file example:

```json
{
  "limits": [{
    "threshold": 5,
    "interval": 5
  }, {
    "threshold": 10,
    "interval": 30
  }],
  "commands": [
    "tellraw @a Spam detected: {{player}}",
    "kick {{player}}"
  ]
}
```