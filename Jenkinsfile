pipeline {
    agent { label 'SlaveNode' }

    environment {
        DOCKER_HOST = 'unix:///var/run/docker.sock'
        DB_USER = 'postgres'
        DB_PASSWORD = 'postgres'
        DB_NAME = 'healthify'
        API_PORT = '5000'
        FRONTEND_PORT = '5173'
        REGISTRY = "192.168.50.4:5000"
        VERSION = "${BUILD_NUMBER}"
        SONAR_SCANNER_OPTS = "-Xmx1024m"
    }

    stages {
        stage('Preparing Files') {
            steps {
                echo " Cleaning workspace"
                deleteDir()
                echo "Cloning repository"
                sh 'git clone https://github.com/SarjakBhandari/JenkinsAutomation'
            }
        }

        stage('Creating Database') {
            steps {
                dir('JenkinsAutomation') {
                    echo "Starting PostgreSQL container"
                    sh 'docker-compose up -d postgres'
                }
            }
        }

        stage('Setting up Backend and Frontend Server') {
            steps {
                script {
                    def dbHostIP = sh(script: "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' healthify_db", returnStdout: true).trim()
                    def apiBaseUrl = "http://192.168.50.3:${API_PORT}/api"

                    echo " Injecting DB_HOST=${dbHostIP} and API_BASE_URL=${apiBaseUrl}"

                    sh "sed -i '/^DB_HOST=/c\\DB_HOST=${dbHostIP}' JenkinsAutomation/app/backend/.env"
                    def configPath = "JenkinsAutomation/app/frontend/src/config.js"
                    sh "echo \"export const API_BASE_URL = '${apiBaseUrl}';\" > ${configPath}"
                }
            }
        }

        stage('Build and Deploy Fullstack App on Staging Environment') {
            steps {
                dir('JenkinsAutomation') {
                    echo "🔨 Building and deploying backend and frontend"
                    sh 'docker-compose up -d --build'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    withCredentials([string(credentialsId: 'sonar-token-id', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            /opt/sonar-scanner/bin/sonar-scanner \
                                -Dsonar.projectKey=healthify \
                                -Dsonar.sources=JenkinsAutomation/app/backend/src/models/ \
                                -Dsonar.host.url=http://192.168.50.4:9000 \
                                -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        stage('Quality Gate Check') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Preview Deployment') {
            steps {
                script {
                    def previewUrl = "http://192.168.50.3:${FRONTEND_PORT}"
                    echo "Preview your site at: ${previewUrl}"
                }

                timeout(time: 1, unit: 'DAYS') {
                    input message: ' Visit the site and approve production deployment when ready.'
                }

                echo "🚀 Production deployment approved"
            }
        }

        stage('Push Images to Local Registry') {
            steps {
                script {
                    def frontendImage = "${REGISTRY}/healthify-frontend:${VERSION}"
                    def backendImage  = "${REGISTRY}/healthify-backend:${VERSION}"

                    echo "🔍 Validating image existence and tagging"

                    sh '''
                        FRONTEND_ID=$(docker images -q healthify-frontend)
                        BACKEND_ID=$(docker images -q healthify-backend)

                        if [ -z "$FRONTEND_ID" ]; then
                            echo "Frontend image not found. Aborting push."
                            exit 1
                        fi

                        if [ -z "$BACKEND_ID" ]; then
                            echo "Backend image not found. Aborting push."
                            exit 1
                        fi

                        echo " Tagging images"
                        docker tag $FRONTEND_ID ${REGISTRY}/healthify-frontend:${VERSION}
                        docker tag $BACKEND_ID ${REGISTRY}/healthify-backend:${VERSION}

                        echo " Pushing to local registry"
                        docker push ${REGISTRY}/healthify-frontend:${VERSION}
                        docker push ${REGISTRY}/healthify-backend:${VERSION}
                    '''
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo "Archiving build artifacts"
                archiveArtifacts artifacts: '**/Dockerfile, **/*.env, **/config.js', fingerprint: true
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
