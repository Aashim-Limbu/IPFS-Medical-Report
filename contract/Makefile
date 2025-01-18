-include .env

.PHONY: all test clean deploy fund help install snapshot format anvil

DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

help:
	@echo "Usage:"
	@echo "  make deploy [ARGS=...]\n    example: make deploy ARGS=\"--network sepolia\""
	@echo ""
	@echo "  make fund [ARGS=...]\n    example: make deploy ARGS=\"--network sepolia\""

all: clean remove install update build

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

<<<<<<< HEAD
install :; forge install foundry-rs/forge-std@v1.5.3 --no-commit && forge install openzeppelin/openzeppelin-contracts@v4.8.3 --no-commit && forge install smartcontractkit/chainlink-brownie-contracts --no-commit
=======
# install :; forge install Cyfrin/foundry-devops@0.0.11 --no-commit && forge install foundry-rs/forge-std@v1.5.3 --no-commit && forge install openzeppelin/openzeppelin-contracts@v4.8.3 --no-commit
install:; forge install openzeppelin/openzeppelin-contracts@v4.8.3 --no-commit && forge install smartcontractkit/chainlink-brownie-contracts --no-commit
>>>>>>> af1e0de48df21856d2a2bfbe704edd17eadfa91d

# Update Dependencies
update:; forge update

build:; forge build

test :; forge test

snapshot :; forge snapshot

format :; forge fmt

anvil :; anvil -m 'test test test test test test test test test test test junk' --steps-tracing --block-time 1

NETWORK_ARGS := --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) --broadcast

ifeq ($(findstring --network sepolia,$(ARGS)),--network sepolia)
	NETWORK_ARGS := --rpc-url $(SEPOLIA_RPC_URL) --account defaultKey --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv
endif

ifeq ($(findstring zksync-sepolia,$(ARGS)),zksync-sepolia)
	NETWORK_ARGS := --rpc-url $(ZKSYNC_RPC) --account defaultKey --verifier zksync --verifier-url https://explorer.sepolia.era.zksync.dev/contract_verification--verify --zksync --broadcast -vvvv
endif

deploy:
	@forge script script/DeployEHRManagement.s.sol:DeployEHRManagement $(NETWORK_ARGS)
