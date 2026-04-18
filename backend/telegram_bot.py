"""
telegram_bot.py
Sends emergency alerts using department-specific Telegram bots.
Enhanced: includes AI-generated preparation steps and clinical note for nurses.
"""

import logging
from datetime import datetime
from telegram import Bot
from telegram.error import TelegramError

logger = logging.getLogger(__name__)

DEPARTMENT_BOT_TOKENS = {
    "Cardiology":   "8799338492:AAEyxa5Hdj5-qIvADiL56oPFvIxWb9s33Jc",
    "Trauma":       "8799338492:AAEyxa5Hdj5-qIvADiL56oPFvIxWb9s33Jc",
    "Orthopaedics": "8799338492:AAEyxa5Hdj5-qIvADiL56oPFvIxWb9s33Jc",
    "ICU":          "8799338492:AAEyxa5Hdj5-qIvADiL56oPFvIxWb9s33Jc",
    "Surgery":      "8799338492:AAEyxa5Hdj5-qIvADiL56oPFvIxWb9s33Jc",
    "Nursing":      "8682961985:AAFkkVsqdR67bBq3v05Z0CR9XcX8tvXGcPI",
    "Maternity":    "8252095341:AAEAC2cIocu_2dhcjrZqDfZs5JwIcsdtIKI",
    "NICU":         "8252095341:AAEAC2cIocu_2dhcjrZqDfZs5JwIcsdtIKI",
    "Lab":          "8624544247:AAFWybrsRG8uDX88EXAjQPEZqu-AFk4Pfi0",
    "Emergency":    "8770940997:AAGrQmd6FOIiM7JIWNrajnpRLUsD3f02CO8",
    "Triage":       "8770940997:AAGrQmd6FOIiM7JIWNrajnpRLUsD3f02CO8",
    "General":      "8770940997:AAGrQmd6FOIiM7JIWNrajnpRLUsD3f02CO8",
    "Neurology":    "8770940997:AAGrQmd6FOIiM7JIWNrajnpRLUsD3f02CO8",
}

CHANNEL_IDS = {
    "Cardiology":   -1003962498660,
    "Trauma":       -1003962498660,
    "Orthopaedics": -1003962498660,
    "ICU":          -1003962498660,
    "Surgery":      -1003962498660,
    "Nursing":      -1003962498660,
    "Maternity":    -1003962498660,
    "NICU":         -1003962498660,
    "Lab":          -1003962498660,
    "Emergency":    -1003962498660,
    "Triage":       -1003962498660,
    "General":      -1003962498660,
    "Neurology":    -1003962498660,
}

DEPT_EMOJIS = {
    "Cardiology":   "❤️",
    "Trauma":       "🚑",
    "Maternity":    "🌸",
    "Lab":          "🧪",
    "ICU":          "🏥",
    "Emergency":    "🚨",
    "Orthopaedics": "🦴",
    "NICU":         "👶",
    "Triage":       "⚕️",
    "Nursing":      "💙",
    "Surgery":      "🔪",
    "General":      "🏥",
    "Neurology":    "🧠",
}

SEVERITY_EMOJIS = {
    "Critical": "🔴",
    "Moderate": "🟡",
    "Stable":   "🟢",
}


def _format_message(departments: list, patient_info: dict, eta: str) -> str:
    severity     = patient_info.get("severity", "Unknown")
    condition    = patient_info.get("condition", "Not specified")
    preparation  = patient_info.get("preparation", [])   # list of prep steps
    clinical_note = patient_info.get("clinical_note", "") # nurse note
    sev_emoji    = SEVERITY_EMOJIS.get(severity, "⚪")
    now          = datetime.now().strftime("%d %b %Y %H:%M:%S")

    lines = [
        "🏥 *INTELLIGENT HEALTHCARE ECOSYSTEM*",
        "━━━━━━━━━━━━━━━━━━━━━",
        f"{sev_emoji} *SEVERITY:* {severity.upper()}",
        f"🕐 *ETA:* {eta} minutes",
        f"📋 *CONDITION:* {condition}",
        "",
        "🎯 *ALERTED DEPARTMENTS:*",
    ]

    for dept in departments:
        emoji = DEPT_EMOJIS.get(dept, "🏥")
        lines.append(f"  {emoji} {dept}")

    # AI-generated preparation checklist
    if preparation:
        lines += ["", "⚕️ *PREPARE ON ARRIVAL:*"]
        for item in preparation:
            lines.append(f"  ✅ {item}")

    # Clinical note for nurses
    if clinical_note:
        lines += ["", f"📝 *CLINICAL NOTE FOR NURSING:*", f"_{clinical_note}_"]

    lines += [
        "",
        "⛓️ *Logged to Blockchain*",
        "🤖 *Triage NLP Agent* processed this alert",
        f"🕐 {now}",
        "━━━━━━━━━━━━━━━━━━━━━",
        "_Please prepare for incoming patient._",
    ]
    return "\n".join(lines)


async def send_alert_async(departments: list, patient_info: dict, eta: str) -> dict:
    """
    Async: send emergency alert to all relevant Telegram channels.
    Called from FastAPI BackgroundTasks — awaited directly in the event loop.
    """
    results      = {}
    sent_channels = set()
    message      = _format_message(departments, patient_info, eta)

    for dept in departments:
        token   = DEPARTMENT_BOT_TOKENS.get(dept)
        chat_id = CHANNEL_IDS.get(dept)

        if not token or not chat_id:
            logger.warning(f"[Telegram] Missing token/chat_id for dept='{dept}'")
            continue

        channel_key = f"{token}:{chat_id}"
        if channel_key in sent_channels:
            logger.info(f"[Telegram] Skipping duplicate channel for {dept}")
            continue
        sent_channels.add(channel_key)

        logger.info(f"[Telegram] → {dept} (chat_id: {chat_id})")
        try:
            bot = Bot(token=token)
            await bot.send_message(chat_id=chat_id, text=message, parse_mode="Markdown")
            logger.info(f"✅ Sent to {dept}")
            results[dept] = {"sent": True}
        except TelegramError as e:
            logger.error(f"❌ TelegramError for {dept}: {e}")
            results[dept] = {"sent": False, "error": str(e)}
        except Exception as e:
            logger.error(f"❌ Error for {dept}: {e}")
            results[dept] = {"sent": False, "error": str(e)}

    return results