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
        SWARM_MANAGER_IP = "192.168.50.5"
        ANSIBLE_DIR = "ansible"
        SSH_KEY = "~/.ssh/id_rsa"
    }

    stages {
        stage('Preparing') {
            steps {
                echo "🧹 Cleaning workspace"
                cleanWs()
                echo "📥 Cloning repository"
                checkout scm
            }
        }

        stage('Start DB Container') {
            steps {
                dir('.') {
                    echo "🐘 Starting PostgreSQL (clean start)"
                    sh '''
                        docker rm -f healthify_db 2>/dev/null || true
                        docker-compose up -d postgres
                    '''
                }
            }
        }


        stage('Inject Environment Variables') {
            steps {
                script {
                    def dbHostIP = sh(script: "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' healthify_db", returnStdout: true).trim()
                    def apiBaseUrl = "http://192.168.50.3:${API_PORT}/api"
                    echo "🔧 Injecting DB_HOST=${dbHostIP} and API_BASE_URL=${apiBaseUrl}"
                    sh "sed -i '/^DB_HOST=/c\\DB_HOST=${dbHostIP}' app/backend/.env"
                    sh "echo \"export const API_BASE_URL = '${apiBaseUrl}';\" > app/frontend/src/config.js"
                }
            }
        }

        stage('Build and Deploy Staging') {
            steps {
                dir('JenkinsAutomation') {
                    echo "🧹 Removing stale app containers"
                    sh '''
                    docker rm -f healthify_backend 2>/dev/null || true
                    docker rm -f healthify_frontend 2>/dev/null || true
                    '''
                    echo "🔨 Building and deploying fullstack app (staging)"
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
                                -Dsonar.sources=app/backend/src/models/ \
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
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Preview and Approval') {
            steps {
                script {
                    def previewUrl = "http://192.168.50.3:${FRONTEND_PORT}"
                    echo "🌐 Preview your site at: ${previewUrl}"
                }
                timeout(time: 1, unit: 'DAYS') {
                    input message: '✅ Approve production deployment when ready.'
                }
                echo "🚀 Production deployment approved"
            }
        }

        stage('Push to Local Registry') {
            steps {
                script {
                    def frontendImage = "${REGISTRY}/healthify-frontend:${VERSION}"
                    def backendImage  = "${REGISTRY}/healthify-backend:${VERSION}"
                    echo "🔖 Tagging and pushing images"
                    sh """
                        docker tag jenkinsautomation_frontend ${frontendImage}
                        docker push ${frontendImage}
                        docker tag jenkinsautomation_backend ${backendImage}
                        docker push ${backendImage}
                    """
                }
            }
        }

        stage('Deploy to Swarm via Ansible') {
            agent { label 'ProductionEnv' }
            steps {
                cleanWs()
                checkout scm
                dir("${ANSIBLE_DIR}") {
                    script {
                        if (!fileExists('playbook.yml')) {
                            error "❌ playbook.yml not found in ${ANSIBLE_DIR}"
                        }
                    }
                    sh '''
                        echo "📂 Running Ansible Swarm deployment"
                        ansible-playbook playbook.yml \
                            --extra-vars "registry_ip=${REGISTRY.split(':')[0]} version=${VERSION}" \
                            -u jenkins \
                            --private-key ${SSH_KEY}
                    '''
                }
            }
        }

        stage('Confirm Ansible Deployment') {
            steps {
                echo """
                ========================================================
                ✅  ANSIBLE SWARM DEPLOYMENT SUCCESSFUL
                🌐  Frontend: http://${SWARM_MANAGER_IP}:5173
                🌐  Backend : http://${SWARM_MANAGER_IP}:5000
                ========================================================
                """
            }
        }

        stage('Deploy Monitoring via Ansible') {
            agent { label 'ProductionEnv' }
            steps {
                checkout scm
                dir("${ANSIBLE_DIR}") {
                    script {
                        if (!fileExists('monitoring.yml')) {
                            error "❌ monitoring.yml not found in ${ANSIBLE_DIR}"
                        }
                    }
                    echo "📈 Deploying Prometheus & Grafana monitoring"
                    sh """
                        ansible-playbook monitoring.yml \
                          -u jenkins \
                          --private-key ${SSH_KEY}
                    """
                }
            }
        }

        stage('Confirm Monitoring & Print URLs') {
            steps {
                echo """
                ========================================================
                📊  Monitoring deployed
                🔗  Prometheus: http://${SWARM_MANAGER_IP}:9090
                🔗  Grafana   : http://${SWARM_MANAGER_IP}:3000
                👤  Grafana admin/admin123 (change after login)
                🔔  Alerts: defined in Prometheus (alert.rules.yml)
                ========================================================
                """
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: '**/Dockerfile, **/*.env, **/config.js, ansible/files/*.yml', fingerprint: true
            }
        }
    }

    post {
        success {
            mail to: 'sarjakytdfiles@gmail.com',
                 subject: '✅ BUILD SUCCESS',
                 body: """Build #${BUILD_NUMBER} succeeded.
App:    http://${SWARM_MANAGER_IP}:5173
API:    http://${SWARM_MANAGER_IP}:5000
Prom:   http://${SWARM_MANAGER_IP}:9090
Grafana: http://${SWARM_MANAGER_IP}:3000 (admin/admin123)
${BUILD_URL}"""
        }
        failure {
            mail to: 'sarjakytdfiles@gmail.com',
                 subject: '❌ BUILD FAILURE',
                 body: "Build #${BUILD_NUMBER} failed. Check logs: ${BUILD_URL}"
        }
    }
}
