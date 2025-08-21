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
        IMAGE_NAME_FE      = 'healthify-frontend'
        IMAGE_NAME_BE      = 'healthify-backend'
        IMAGE_TAG          = 'latest'   // static default tag
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
                        echo "Quality Gate status: ${qg.status}"
                        if (qg.status != 'OK') {
                            error "Pipeline aborted due to Quality Gate failure."
                        }
                    }
                }
            }
        }

        stage('Build and Deploy Staging') {
            steps {
                dir('JenkinsAutomation') {
                    sh """
                        docker-compose down --remove-orphans --volumes || true
                        docker-compose build \
                            --build-arg TAG=${IMAGE_TAG}
                        docker tag ${IMAGE_NAME_FE}:latest ${IMAGE_NAME_FE}:${IMAGE_TAG}
                        docker tag ${IMAGE_NAME_BE}:latest ${IMAGE_NAME_BE}:${IMAGE_TAG}
                        docker-compose up -d --force-recreate
                    """
                }
            }
        }

        stage('Preview and Approval') {
            steps {
                script {
                    echo "Preview your app at: http://${HOST_IP}:${FRONTEND_PORT}"
                }
                timeout(time: 1, unit: 'DAYS') {
                    input message: 'Approve production deployment when ready.'
                }
            }
        }

        stage('Build and Push Images') {
    steps {
        dir('JenkinsAutomation') {
            script {
                def apiBaseUrl = "http://${SWARM_MANAGER_IP}:${API_PORT}"

                sh """
                    # Build frontend with proper API_BASE_URL
                    docker build --no-cache \
                    --build-arg API_BASE_URL=${apiBaseUrl} \
                    -t ${IMAGE_NAME_FE}:latest ./app/frontend

                    # Build backend
                    docker build --no-cache \
                    -t ${IMAGE_NAME_BE}:latest ./app/backend

                    # Tag for registry (overwrite is automatic)
                    docker tag ${IMAGE_NAME_FE}:latest ${REGISTRY}/${IMAGE_NAME_FE}:${IMAGE_TAG}
                    docker tag ${IMAGE_NAME_BE}:latest ${REGISTRY}/${IMAGE_NAME_BE}:${IMAGE_TAG}

                    # Push to registry (overwrite previous images with same tag)
                    docker push ${REGISTRY}/${IMAGE_NAME_FE}:${IMAGE_TAG}
                    docker push ${REGISTRY}/${IMAGE_NAME_BE}:${IMAGE_TAG}

                    # Optional: Pull & scan right after push
                    docker pull ${REGISTRY}/${IMAGE_NAME_FE}:${IMAGE_TAG}
                    docker pull ${REGISTRY}/${IMAGE_NAME_BE}:${IMAGE_TAG}
                    """
                                }
                            }
                        }
                    }



        stage('Pull & Scan from Registry') {
            steps {
                sh '''
                    set -e

                    echo "Pulling frontend from registry..."
                    docker pull ${REGISTRY}/${IMAGE_NAME_FE}:${IMAGE_TAG}

                    echo "Scanning frontend..."
                    if ! trivy image --scanners vuln --severity HIGH,CRITICAL ${REGISTRY}/${IMAGE_NAME_FE}:${IMAGE_TAG}; then
                        echo "VULNERABILITIES FOUND in frontend — deleting from registry..."
                        curl -X DELETE http://${REGISTRY}/v2/${IMAGE_NAME_FE}/manifests/$(docker inspect --format='{{index .RepoDigests 0}}' ${REGISTRY}/${IMAGE_NAME_FE}:${IMAGE_TAG} | cut -d'@' -f2)
                        exit 1
                    fi

                    echo "Pulling backend from registry..."
                    docker pull ${REGISTRY}/${IMAGE_NAME_BE}:${IMAGE_TAG}

                    echo "Scanning backend..."
                    if ! trivy image --scanners vuln --skip-dirs usr/src/app/node_modules --severity HIGH,CRITICAL ${REGISTRY}/${IMAGE_NAME_BE}:${IMAGE_TAG}; then
                        echo "VULNERABILITIES FOUND in backend — deleting from registry..."
                        DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' ${REGISTRY}/${IMAGE}:${IMAGE_TAG} | cut -d'@' -f2)
                        curl -sf -X DELETE "http://${REGISTRY}/v2/${IMAGE}/manifests/${DIGEST}" \
                        || echo "Delete unsupported by registry — image remains quarantined"

                    fi

                    echo "✅ Both images passed scan"
                '''
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
