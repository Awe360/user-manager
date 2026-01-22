pipeline {
    agent any 

    environment {
        DOCKER_IMAGE_NAME     = "awoke/user-manager"
        DOCKER_TAG            = "${env.BUILD_NUMBER}"
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        KUBECONFIG            = "C:\\jenkins-kube\\config-minikube"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out source code..."
                checkout scm 
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build React App') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${DOCKER_IMAGE_NAME}:${DOCKER_TAG}")
                }
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_CREDENTIALS_ID) {
                        dockerImage.push()                    // pushes :BUILD_NUMBER
                        dockerImage.push('latest')            // also tags & pushes :latest
                    }
                }
            }
        }

        stage('Deploy to Kubernetes (Minikube)') {
            steps {
                script {
                    // Assumes kubectl is installed on the Jenkins agent
                    // and kubeconfig points to Minikube (see setup notes below)
                    bat '''
                        kubectl apply -f deployment.yaml
                        kubectl apply -f service.yaml
                        kubectl rollout restart deployment/user-manager
                    '''
                    // Optional: wait for rollout
                    bat 'kubectl rollout status deployment/user-manager --timeout=120s'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished!'
            // Optional: clean workspace
            cleanWs()
        }
        success {
            echo 'Deployment successful 🎉'
        }
        failure {
            echo 'Pipeline failed 😞'
        }
    }
}