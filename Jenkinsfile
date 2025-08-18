pipeline {
    agent { label 'SlaveNode' }

    environment {
        DOCKER_HOST = 'unix:///var/run/docker.sock'
        DB_USER = 'postgres'
        DB_PASSWORD = 'postgres'
        DB_NAME = 'healthify'
        API_PORT = '5000'
        FRONTEND_PORT = '5173'
    }

    stages {
        stage('Validate Docker Access') {
            steps {
                echo "Checking Docker daemon connectivity"
                sh 'docker info'
            }
        }

        stage('Clean Workspace') {
            steps {
                echo "Cleaning workspace"
                deleteDir()
            }
        }

        stage('Clone Repository') {
            steps {
                echo "Cloning repository"
                sh 'git clone https://github.com/SarjakBhandari/JenkinsAutomation'
            }
        }

        stage('Start PostgreSQL Container') {
            steps {
                dir('JenkinsAutomation') {
                    echo "Starting PostgreSQL container"
                    sh 'docker-compose up -d postgres'
                }
            }
        }

        stage('Inject DB Host IP into .env') {
            steps {
                script {
                    def dbHostIP = sh(script: "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' healthify_db", returnStdout: true).trim()
                    def apiBaseUrl = "http://${dbHostIP}:${API_PORT}/api"

                    echo "Injecting DB_HOST=${dbHostIP} and REACT_APP_API_BASE_URL=${apiBaseUrl}"

                    // Update backend .env
                    sh "sed -i '/^DB_HOST=/c\\DB_HOST=${dbHostIP}' JenkinsAutomation/app/backend/.env"

                    // Update frontend .env
                    sh "sed -i '/^REACT_APP_API_BASE_URL=/c\\REACT_APP_API_BASE_URL=${apiBaseUrl}' JenkinsAutomation/app/frontend/.env"
                }
            }
        }

        stage('Build and Deploy Fullstack App') {
            steps {
                dir('JenkinsAutomation') {
                    echo "Building and deploying backend and frontend"
                    sh 'docker-compose up -d --build'
                }
            }
        }
        stage('Preview Deployment') {
            steps {
                script {
                    def dbHostIP = sh(script: "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' healthify_frontend", returnStdout: true).trim()
                    def previewUrl = "http://192.168.53.3:${FRONTEND_PORT}"

                    echo "Preview your site at: ${previewUrl}"
                }

                timeout(time: 1, unit: 'DAYS') {
                    input message: 'Visit the site and approve production deployment when ready.'
                }

                echo "Production deployment approved"
            }
        }
    }

    post {
        success {
            mail to: 'sarjakytdfiles@gmail.com',
                 subject: '✅ BUILD SUCCESS NOTIFICATION',
                 body: """Hi Sarjak,

Build #${BUILD_NUMBER} was successful. Visit: ${BUILD_URL}

Regards,
Jenkins"""
        }
        failure {
            mail to: 'sarjakytdfiles@gmail.com',
                 subject: '❌ BUILD FAILED NOTIFICATION',
                 body: """Hi Sarjak,

Build #${BUILD_NUMBER} failed. Check logs: ${BUILD_URL}

Regards,
Jenkins"""
        }
    }
}