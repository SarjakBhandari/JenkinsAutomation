pipeline {
    agent { label 'SlaveNode' }

    environment {
        DOCKER_HOST        = 'unix:///var/run/docker.sock'
        DB_USER            = 'postgres'
        DB_PASSWORD        = 'postgres'
        DB_NAME            = 'healthify'
        API_PORT           = '5050'
        FRONTEND_PORT      = '5173'
        REGISTRY           = "192.168.50.4:5000"
        VERSION            = "${BUILD_NUMBER}"
        SONAR_SCANNER_OPTS = "-Xmx1024m"
        SWARM_MANAGER_IP   = "192.168.50.4"
        ANSIBLE_DIR        = "Prod"
        SSH_KEY            = "~/.ssh/id_rsa"
        HOST_IP            = "192.168.50.3"
    }

    stages {

        stage('Prepare Workspace') {
            steps {
                deleteDir()
                sh 'git clone https://github.com/SarjakBhandari/JenkinsAutomation'
            }
        }

        stage('Inject Environment Variables') {
            steps {
                script {
                    def apiBaseUrl = "http://${HOST_IP}:${API_PORT}/api/"
                    writeFile file: 'JenkinsAutomation/app/backend/.env', text: """
                    PORT=${API_PORT}
                    DB_HOST=healthify_db
                    DB_USER=${DB_USER}
                    DB_PASSWORD=${DB_PASSWORD}
                    DB_NAME=${DB_NAME}
                    JWT_SECRET=healthify
                    EXPIRES_IN=24h
                    """
                    writeFile file: 'JenkinsAutomation/app/frontend/src/config.js',
                              text: "export const API_BASE_URL = '${apiBaseUrl}';\n"
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

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()
                        echo "🔍 Quality Gate status: ${qg.status}"
                        if (qg.status != 'OK') {
                            error "❌ Pipeline aborted due to Quality Gate failure."
                        }
                    }
                }
            }
        }


        stage('Build and Deploy Staging') {
            steps {
                dir('JenkinsAutomation') {
                    sh '''
                        docker-compose down --remove-orphans --volumes || true
                        docker-compose up -d --build --force-recreate
                    '''
                }
            }
        }

        

        stage('Preview and Approval') {
            steps {
                script {
                    echo "🖥 Preview your app at: http://${HOST_IP}:${FRONTEND_PORT}"
                }
                timeout(time: 1, unit: 'DAYS') {
                    input message: '✅ Approve production deployment when ready.'
                }
            }
        }

        stage('Tag, Scan, and Push Images') {
            steps {
                script {
                    def frontendImage = "${REGISTRY}/healthify-frontend:latest"
                    def backendImage  = "${REGISTRY}/healthify-backend:latest"

                    // Tag from running containers
                    sh """
                        docker tag \$(docker inspect -f '{{.Image}}' \$(docker ps -qf name=healthify_frontend)) ${frontendImage}
                        docker tag \$(docker inspect -f '{{.Image}}' \$(docker ps -qf name=healthify_backend)) ${backendImage}
                    """

                    // Run Trivy scan on each image
                    sh """
                        echo '🔍 Scanning frontend image for vulnerabilities...'
                        trivy image --exit-code 1 --severity HIGH,CRITICAL ${frontendImage}

                        echo '🔍 Scanning backend image for vulnerabilities...'
                        trivy image --exit-code 1 --severity HIGH,CRITICAL ${backendImage}
                    """

                    // Push only if scans pass
                    sh """
                        docker push ${frontendImage}
                        docker push ${backendImage}
                    """
                }
            }
        }
    }

    post {
        success {
            mail to: 'sarjakytdfiles@gmail.com',
                 subject: 'BUILD SUCCESS',
                 body: """Build #${BUILD_NUMBER} succeeded.
App: http://${SWARM_MANAGER_IP}:5173
API: http://${SWARM_MANAGER_IP}:5000
Prometheus: http://${SWARM_MANAGER_IP}:9090
Grafana: http://${SWARM_MANAGER_IP}:3000 (admin/admin123)
${BUILD_URL}"""
        }
        failure {
            mail to: 'sarjakytdfiles@gmail.com',
                 subject: 'BUILD FAILURE',
                 body: "Build #${BUILD_NUMBER} failed. Check logs: ${BUILD_URL}"
        }
    }
}
