# Terraform snippet for Cloud Run service and Serverless NEG (example)
provider "google" { project = var.project region = "us-central1" }

resource "google_cloud_run_service" "notification" {
  name     = "notification-service"
  location = "us-central1"
  template {
    spec {
      containers {
        image = "gcr.io/${var.project}/notification-service:v1"
      }
    }
  }
}
