from locust import HttpUser, task, between
import random

class TicketUser(HttpUser):
    wait_time = between(1, 3)

    @task(5)
    def view_shows(self):
        self.client.get('/api/shows')

    @task(3)
    def hold_and_book(self):
        show = random.choice(['show1','show2','show3'])
        r = self.client.post('/api/hold', json={'show_id': show, 'seats': ['A1','A2']})
        if r.status_code == 200:
            booking = r.json()
            self.client.post(f"/api/book/{booking.get('id')}/confirm")
