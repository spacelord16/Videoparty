import re
from typing import Dict, Optional
from urllib.parse import urlparse, parse_qs


def detect_video_platform(url: str) -> Dict[str, str]:
    """
    Detect the video platform and extract relevant information
    Returns: {"platform": "youtube/vimeo/twitch/direct", "video_id": "...", "embed_url": "..."}
    """
    result = {
        "platform": "direct",
        "video_id": None,
        "embed_url": url,
        "thumbnail": None,
    }

    # YouTube detection
    youtube_patterns = [
        r"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})",
        r"youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})",
    ]

    for pattern in youtube_patterns:
        match = re.search(pattern, url)
        if match:
            video_id = match.group(1)
            result.update(
                {
                    "platform": "youtube",
                    "video_id": video_id,
                    "embed_url": f"https://www.youtube.com/embed/{video_id}",
                    "thumbnail": f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",
                }
            )
            return result

    # Vimeo detection
    vimeo_pattern = r"vimeo\.com\/(\d+)"
    match = re.search(vimeo_pattern, url)
    if match:
        video_id = match.group(1)
        result.update(
            {
                "platform": "vimeo",
                "video_id": video_id,
                "embed_url": f"https://player.vimeo.com/video/{video_id}",
                "thumbnail": f"https://vumbnail.com/{video_id}.jpg",
            }
        )
        return result

    # Twitch detection
    twitch_patterns = [
        r"twitch\.tv\/videos\/(\d+)",
        r"twitch\.tv\/(\w+)$",  # Live stream
    ]

    for pattern in twitch_patterns:
        match = re.search(pattern, url)
        if match:
            video_id = match.group(1)
            if "videos" in url:
                result.update(
                    {
                        "platform": "twitch",
                        "video_id": video_id,
                        "embed_url": f"https://player.twitch.tv/?video={video_id}&parent=localhost",
                        "thumbnail": None,
                    }
                )
            else:
                result.update(
                    {
                        "platform": "twitch_live",
                        "video_id": video_id,
                        "embed_url": f"https://player.twitch.tv/?channel={video_id}&parent=localhost",
                        "thumbnail": None,
                    }
                )
            return result

    # If no platform detected, treat as direct video URL
    return result


def get_video_info(url: str) -> Dict[str, str]:
    """
    Get comprehensive video information including platform detection
    """
    info = detect_video_platform(url)

    # Add additional metadata based on platform
    if info["platform"] == "youtube":
        info["supports_sync"] = True
        info["requires_cors"] = False
    elif info["platform"] == "vimeo":
        info["supports_sync"] = True
        info["requires_cors"] = False
    elif info["platform"] in ["twitch", "twitch_live"]:
        info["supports_sync"] = False  # Twitch streams are live
        info["requires_cors"] = True
    else:
        info["supports_sync"] = True
        info["requires_cors"] = True

    return info
