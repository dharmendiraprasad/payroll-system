pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                echo 'Building Payroll System...'
            }
        }
        stage('Test') {
            steps {
                echo 'Running Unit Tests for Payroll System...'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying Payroll System application...'
            }
        }
    }
}
