import re
import unittest
from pathlib import Path

from main import app

ROOT = Path(__file__).resolve().parents[1]


class PengDuelAppTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = app.test_client()

    def test_home_page_exposes_game_surface(self) -> None:
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"PengDuel", response.data)
        self.assertIn(b'id="gameCanvas"', response.data)
        self.assertIn(b'id="single-player"', response.data)
        self.assertIn(b'id="two-player"', response.data)
        self.assertIn(b"Player 1 uses W, A, S, D", response.data)

    def test_page_is_static_and_hostable_from_a_subpath(self) -> None:
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("{{", html)
        # Every local asset is relative, so GitHub Pages can serve it under /PengDuel/.
        for ref in re.findall(r'(?:src|href)="([^"#]+)"', html):
            if not ref.startswith("http"):
                self.assertFalse(ref.startswith("/"), ref)
                self.assertTrue((ROOT / ref).is_file(), ref)

    def test_static_assets_are_served(self) -> None:
        for path in ["/static/js/game.js", "/static/css/styles.css", "/static/favicon.svg"]:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 200)
                response.close()


if __name__ == "__main__":
    unittest.main()
