# Ticketing App - A Microservice architecture based implementation

## Services

1. Auth
2. Client
3. Tickets
4. Orders
5. Payments
6. Expiration Service

## Utils

### common package

This package which is published on npm is used by different services. It includes authentication helper. Publishers ad Consumer Base classes, and event envelop and definitions.

### Message Broker (Event Bus)

Nats is used as a message queue and an event broker. Services subscribe to nats streaming server in order to push and consume events.

### Infra

Kubernetes and Docker help to containarize all the services and orchastrate them. Each service contains a dockerfile whilst the infra folder contains all the kubernetes manifests for deployments, services, ingress, secrets etc

### Development

Skaffold is used to help with development mode to deploy all services to a local cluster and watch file changes as well.
Skaffold config has the options to watch for specific files extensions.

An easy way to develop is to develop in isolation and test each services in isolation with proper contract testing. But inorder to see all services running together whilst mimicing a real environment Skaffold gives the ability to deploy all k8s objects to a local cluster. For this project, minikube is recommended and used.

In order to run:

`skaffold dev`

This will spin up all the objects in the local container.

Postman collections are also included and can be found in the misc folder.

## Auth

- Service for authentication.
  - Express, Node, Mongodb

## Client

- Server side rendered client application
  - Next, React

## Tickets

- List, show, create, edit a ticket

## Orders

- List, show, create, edit an Order

## Payments

- Creates a payment for the order and changes order status. Payment with stripe included. Can be enhanced for more, i.e. paypal etc

## Architecture

![Alt text](./misc/ticketing-architecture.png?raw=true 'A Microservice architectural approach')
