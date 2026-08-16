import unittest

from main import app


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


if __name__ == "__main__":
    unittest.main()
