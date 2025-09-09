"""
AI-powered content recommendation system for VideoParty
"""

import random
from typing import List, Dict, Any
from .video_utils import detect_video_platform


class ContentRecommendations:
    def __init__(self):
        # Curated content categories for smart recommendations
        self.content_database = {
            "lofi": [
                {
                    "title": "🎵 Lofi Hip Hop Radio - Beats to Relax/Study",
                    "url": "https://www.youtube.com/watch?v=jfKfPfyJRdk",
                    "platform": "youtube",
                    "category": "music",
                    "mood": "chill",
                    "thumbnail": "https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
                },
                {
                    "title": "🌙 Midnight Lofi Vibes",
                    "url": "https://www.youtube.com/watch?v=DWcJFNfaw9c",
                    "platform": "youtube",
                    "category": "music",
                    "mood": "chill",
                    "thumbnail": "https://img.youtube.com/vi/DWcJFNfaw9c/maxresdefault.jpg",
                },
            ],
            "jazz": [
                {
                    "title": "🎷 Smooth Jazz for Work & Study",
                    "url": "https://www.youtube.com/watch?v=Dx5qFachd3A",
                    "platform": "youtube",
                    "category": "music",
                    "mood": "relaxing",
                    "thumbnail": "https://img.youtube.com/vi/Dx5qFachd3A/maxresdefault.jpg",
                },
                {
                    "title": "☕ Coffee Shop Jazz Ambience",
                    "url": "https://www.youtube.com/watch?v=bM7SZ5SBzyY",
                    "platform": "youtube",
                    "category": "music",
                    "mood": "relaxing",
                    "thumbnail": "https://img.youtube.com/vi/bM7SZ5SBzyY/maxresdefault.jpg",
                },
            ],
            "nature": [
                {
                    "title": "🌊 Ocean Waves for Deep Sleep",
                    "url": "https://www.youtube.com/watch?v=V1bFr2SWP1I",
                    "platform": "youtube",
                    "category": "ambient",
                    "mood": "peaceful",
                    "thumbnail": "https://img.youtube.com/vi/V1bFr2SWP1I/maxresdefault.jpg",
                },
                {
                    "title": "🌲 Forest Rain Sounds",
                    "url": "https://www.youtube.com/watch?v=nDq6TstdEi8",
                    "platform": "youtube",
                    "category": "ambient",
                    "mood": "peaceful",
                    "thumbnail": "https://img.youtube.com/vi/nDq6TstdEi8/maxresdefault.jpg",
                },
            ],
            "tech": [
                {
                    "title": "💻 Coding in Python - Live Session",
                    "url": "https://www.youtube.com/watch?v=kqtD5dpn9C8",
                    "platform": "youtube",
                    "category": "educational",
                    "mood": "focused",
                    "thumbnail": "https://img.youtube.com/vi/kqtD5dpn9C8/maxresdefault.jpg",
                },
                {
                    "title": "🚀 React Tutorial for Beginners",
                    "url": "https://www.youtube.com/watch?v=Ke90Tje7VS0",
                    "platform": "youtube",
                    "category": "educational",
                    "mood": "focused",
                    "thumbnail": "https://img.youtube.com/vi/Ke90Tje7VS0/maxresdefault.jpg",
                },
            ],
            "gaming": [
                {
                    "title": "🎮 Epic Gaming Moments Compilation",
                    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "platform": "youtube",
                    "category": "entertainment",
                    "mood": "energetic",
                    "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
                }
            ],
        }

    def analyze_content_preferences(self, playlist: List[Dict]) -> Dict[str, float]:
        """Analyze user's content preferences from their playlist"""
        if not playlist:
            return {
                "music": 0.4,
                "educational": 0.3,
                "ambient": 0.2,
                "entertainment": 0.1,
            }

        category_scores = {}
        mood_scores = {}

        for item in playlist:
            # Analyze based on video title keywords
            title = item.get("title", "").lower()

            # Category detection
            if any(word in title for word in ["music", "song", "beat", "lofi", "jazz"]):
                category_scores["music"] = category_scores.get("music", 0) + 1
            elif any(word in title for word in ["tutorial", "learn", "course", "code"]):
                category_scores["educational"] = (
                    category_scores.get("educational", 0) + 1
                )
            elif any(word in title for word in ["nature", "rain", "ocean", "ambient"]):
                category_scores["ambient"] = category_scores.get("ambient", 0) + 1
            else:
                category_scores["entertainment"] = (
                    category_scores.get("entertainment", 0) + 1
                )

        # Normalize scores
        total = sum(category_scores.values()) or 1
        return {k: v / total for k, v in category_scores.items()}

    def get_smart_recommendations(
        self, current_playlist: List[Dict], limit: int = 5
    ) -> List[Dict]:
        """Generate AI-powered recommendations based on current playlist"""
        preferences = self.analyze_content_preferences(current_playlist)
        recommendations = []

        # Get content based on preferences
        for category, score in preferences.items():
            if score > 0.1:  # Only recommend categories with some preference
                category_content = []

                # Map preferences to our content database
                if category == "music":
                    category_content.extend(self.content_database.get("lofi", []))
                    category_content.extend(self.content_database.get("jazz", []))
                elif category == "educational":
                    category_content.extend(self.content_database.get("tech", []))
                elif category == "ambient":
                    category_content.extend(self.content_database.get("nature", []))
                elif category == "entertainment":
                    category_content.extend(self.content_database.get("gaming", []))

                # Add weighted random selection
                num_from_category = max(1, int(score * limit))
                selected = random.sample(
                    category_content, min(num_from_category, len(category_content))
                )
                recommendations.extend(selected)

        # If no recommendations yet, add some defaults
        if not recommendations:
            recommendations = random.sample(
                self.content_database["lofi"] + self.content_database["jazz"],
                min(limit, 4),
            )

        # Remove duplicates and limit
        seen_urls = set()
        unique_recommendations = []
        for rec in recommendations:
            if rec["url"] not in seen_urls:
                seen_urls.add(rec["url"])
                unique_recommendations.append(rec)
                if len(unique_recommendations) >= limit:
                    break

        return unique_recommendations

    def get_trending_content(self, limit: int = 3) -> List[Dict]:
        """Get trending/popular content recommendations"""
        trending = [
            {
                "title": "🔥 Trending: Epic Chill Vibes",
                "url": "https://www.youtube.com/watch?v=jfKfPfyJRdk",
                "platform": "youtube",
                "category": "music",
                "mood": "trending",
                "thumbnail": "https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
                "views": "10M+",
            },
            {
                "title": "🌟 Popular: Night City Ambience",
                "url": "https://www.youtube.com/watch?v=V1bFr2SWP1I",
                "platform": "youtube",
                "category": "ambient",
                "mood": "trending",
                "thumbnail": "https://img.youtube.com/vi/V1bFr2SWP1I/maxresdefault.jpg",
                "views": "5M+",
            },
            {
                "title": "⚡ Hot: Gaming Music Mix",
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "platform": "youtube",
                "category": "entertainment",
                "mood": "trending",
                "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
                "views": "8M+",
            },
        ]

        return random.sample(trending, min(limit, len(trending)))

    def get_mood_based_recommendations(self, mood: str, limit: int = 3) -> List[Dict]:
        """Get recommendations based on specific mood"""
        mood_mapping = {
            "chill": self.content_database["lofi"] + self.content_database["jazz"],
            "focus": self.content_database["tech"] + self.content_database["nature"],
            "relax": self.content_database["nature"] + self.content_database["jazz"],
            "energy": self.content_database["gaming"],
            "study": self.content_database["lofi"] + self.content_database["tech"],
        }

        content = mood_mapping.get(mood.lower(), self.content_database["lofi"])
        return random.sample(content, min(limit, len(content)))


# Global instance
ai_recommendations = ContentRecommendations()
