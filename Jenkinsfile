pipeline {
    agent {
        label 'SlaveNode'
    }

    environment {
        DB_USER = 'postgres'
        DB_PASSWORD = 'postgres'
        DB_NAME = 'healthify'
        API_PORT = '5000'
        FRONTEND_PORT = '3000'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                echo "Cleaning workspace"
                deleteDir()
            }
        }

        stage('Clone Repository') {
            steps {
                echo "Cloning repository"
                sh 'git clone https://github.com/SarjakBhandari/YourRepo.git'
            }
        }

        stage('Start Initial Containers') {
            steps {
                dir('YourRepo/app') {
                    echo "tarting PostgreSQL container"
                    sh 'docker-compose up -d postgres'
                }
            }
        }

        stage('Inject DB Host IP into .env') {
            steps {
                script {
                    def dbHostIP = sh(script: "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' healthify_db", returnStdout: true).trim()
                    def apiBaseUrl = "http://${dbHostIP}:${API_PORT}/api"

                    echo "njecting DB_HOST=${dbHostIP} and REACT_APP_API_BASE_URL=${apiBaseUrl}"

                    // Update backend .env
                    sh "sed -i '/^DB_HOST=/c\\DB_HOST=${dbHostIP}' YourRepo/app/.env"

                    // Update frontend .env
                    sh "sed -i '/^REACT_APP_API_BASE_URL=/c\\REACT_APP_API_BASE_URL=${apiBaseUrl}' YourRepo/app/frontend/.env"
                }
            }
        }

        stage('Build and Deploy Fullstack App') {
            steps {
                dir('YourRepo/app') {
                    echo " Building and deploying backend and frontend"
                    sh 'docker-compose up -d --build'
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                timeout(time: 1, unit: 'DAYS') {
                    input message: 'Approve production deployment?'
                }
                echo "Production deployment approved"
            }
        }
    }

    post {
        success {
            mail to: 'sarjakytdfiles@gmail.com',
                 subject: 'BUILD SUCCESS NOTIFICATION',
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