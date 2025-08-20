pipeline {
    agent { label 'SlaveNode' }

    environment {
        DOCKER_HOST        = 'unix:///var/run/docker.sock'
        DB_USER            = 'postgres'
        DB_PASSWORD        = 'postgres'
        DB_NAME            = 'healthify'
        API_PORT           = '5000'
        FRONTEND_PORT      = '5173'
        REGISTRY           = "192.168.50.4:5000"
        VERSION            = "${BUILD_NUMBER}"
        SONAR_SCANNER_OPTS = "-Xmx1024m"
        SWARM_MANAGER_IP   = "192.168.50.5"
        ANSIBLE_DIR        = "Prod"
        SSH_KEY            = "~/.ssh/id_rsa"
        HOST_IP            = "192.168.50.3"
    }

    stages {

        stage('Prepare Workspace') {
            steps {
                echo "🧹 Cleaning workspace"
                deleteDir()
                echo "📥 Cloning repository"
                sh 'git clone https://github.com/SarjakBhandari/JenkinsAutomation'
            }
        }

        stage('Inject Environment Variables') {
            steps {
                script {
                    def apiBaseUrl = "http://${HOST_IP}:${API_PORT}/api"
                    echo "⚙️ Injecting environment configs"
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

        stage('Build and Deploy Staging') {
            steps {
                dir('JenkinsAutomation') {
                    echo "🐳 Building and starting staging stack (Docker Compose)"
                    sh '''
                        docker-compose down --remove-orphans --volumes || true
                        docker-compose up -d --build --force-recreate
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    withCredentials([string(credentialsId: 'sonar-token-id', variable: 'SONAR_TOKEN')]) {
                        echo "🔍 Running SonarQube scan"
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
                echo "⏳ Waiting for quality gate"
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Preview and Approval') {
            steps {
                script {
                    def previewUrl = "http://${HOST_IP}:${FRONTEND_PORT}"
                    echo "🖥 Preview your app at: ${previewUrl}"
                }
                timeout(time: 1, unit: 'DAYS') {
                    input message: '✅ Approve production deployment when ready.'
                }
            }
        }

        stage('Tag and Push Images') {
            steps {
                script {
                    def frontendImage = "${REGISTRY}/healthify-frontend:${VERSION}"
                    def backendImage  = "${REGISTRY}/healthify-backend:${VERSION}"
                    echo "📦 Tagging & pushing images to registry ${REGISTRY}"

                    def frontendId = sh(script: "docker inspect -f '{{.Image}}' healthify_frontend", returnStdout: true).trim()
                    def backendId  = sh(script: "docker inspect -f '{{.Image}}' healthify_backend", returnStdout: true).trim()

                    sh """
                        docker tag ${frontendId} ${frontendImage}
                        docker push ${frontendImage}
                        docker tag ${backendId} ${backendImage}
                        docker push ${backendImage}
                    """
                }
            }
        }

        stage('Deploy to Swarm via Ansible') {
            agent { label 'ProductionEnv' }
            steps {
                script {
                    def registryIpOnly = REGISTRY.split(':')[0]
                    dir("${ANSIBLE_DIR}") {
                        echo "🔗 Ensuring overlay network exists before deploy"
                    sh """
                        ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
                            -i ${SSH_KEY} jenkins@${SWARM_MANAGER_IP} \
                            'docker network inspect healthify_net >/dev/null 2>&1 || \
                            docker network create --driver overlay --attachable healthify_net'
                    """

                        echo "🚀 Deploying stack to Docker Swarm"
                        sh """
                            ansible-playbook playbook.yml \
    -u jenkins \
    --private-key ${SSH_KEY} \
    --extra-vars "registry_ip=${REGISTRY_IP} version=${VERSION}"

                        """
                    }
                }
            }
        }


        stage('Confirm Ansible Deployment') {
            steps {
                echo """
========================================================
✅ ANSIBLE SWARM DEPLOYMENT SUCCESSFUL
Frontend: http://${SWARM_MANAGER_IP}:5173
Backend : http://${SWARM_MANAGER_IP}:5000
========================================================
"""
            }
        }

        stage('Deploy Monitoring via Ansible') {
            agent { label 'ProductionEnv' }
            steps {
                dir("${ANSIBLE_DIR}") {
                    echo "📊 Deploying monitoring stack"
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
📈 Monitoring deployed
Prometheus: http://${SWARM_MANAGER_IP}:9090
Grafana   : http://${SWARM_MANAGER_IP}:3000
Grafana credentials: admin/admin123
========================================================
"""
            }
        }

        stage('Validate Swarm Health') {
            agent { label 'ProductionEnv' }
            steps {
                echo "🩺 Checking Swarm node and service health"
                sh """
                    ssh -i ${SSH_KEY} jenkins@${SWARM_MANAGER_IP} '
                        docker node ls &&
                        docker service ls &&
                        docker ps --filter "health=unhealthy"
                    '
                """
            }
        }

        stage('Check Container Resource Usage') {
            agent { label 'ProductionEnv' }
            steps {
                echo "📊 Checking container resource usage"
                sh """
                    ssh -i ${SSH_KEY} jenkins@${SWARM_MANAGER_IP} '
                        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
                    '
                """
            }
        }

        stage('Cleanup Dangling Images') {
            agent { label 'ProductionEnv' }
            steps {
                echo "🧹 Cleaning up unused Docker images"
                sh """
                    ssh -i ${SSH_KEY} jenkins@${SWARM_MANAGER_IP} '
                        docker image prune -f
                    '
                """
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
