import { BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts"
import {
  Benzene,
  Mint,
  Burn,
  Approval,
  Transfer as TransferEvent,
  MigrateCall
} from "../generated/Benzene/Benzene"
import { Token, Transfer, Account, Migrate, MintEvent } from "../generated/schema"


export function handleMigrate(call: MigrateCall): void {
  
  let migrate = new Migrate(call.transaction.hash.toHex())

  migrate.contract = call.inputs.token
  migrate.owner = call.inputs.account
  migrate.amount = call.inputs.amount.toBigDecimal()

  migrate.save()

}

export function handleMint(event: Mint): void {

  let bzn = getBenzeneInstance(event.address);

  let token = Token.load(event.address.toHex())

  if (token == null) {
    token = new Token(event.address.toHex())
    token.mintEventCount = 0
    token.address = event.address
    token.decimals = bzn.decimals()
    token.name = bzn.name()
    token.symbol = bzn.symbol()
    token.advisors = bzn.AdvisorPoolAddress()
    token.team = bzn.TeamPoolAddress()
    token.game = bzn.GamePoolAddress()
  }

  token.mintEventCount += 1

  token.save()


  let mint = new MintEvent(event.transaction.hash.toHex())
  mint.transaction = event.transaction.hash
  mint.block = event.block.timestamp
  mint.amount = event.params.amount
  mint.sender = event.transaction.from
  mint.minter = event.transaction.from
  mint.destination = event.params.to

  mint.save()


  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  // if (entity == null) {
    // entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    // entity.count = BigInt.fromI32(0)
  // }

  // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  // entity.to = event.params.to
  // entity.amount = event.params.amount

  // Entities can be written to the store with `.save()`
  // entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.name(...)
  // - contract.approve(...)
  // - contract.totalSupply(...)
  // - contract.transferFrom(...)
  // - contract.decimals(...)
  // - contract.AdvisorPoolAddress(...)
  // - contract.decreaseApproval(...)
  // - contract.balanceOf(...)
  // - contract.symbol(...)
  // - contract.transfer(...)
  // - contract.increaseApproval(...)
  // - contract.GamePoolAddress(...)
  // - contract.allowance(...)
  // - contract.TeamPoolAddress(...)
}

export function handleBurn(event: Burn): void {}

export function handleApproval(event: Approval): void {}

export function handleTransfer(event: TransferEvent): void {
  //filter out burn transfers as those are reduntantly covered by burn event
  if(event.params.to.toHexString() != "0x0000000000000000000000000000000000000000") {

  }
  let transfer = new Transfer(event.transaction.hash.toHex() + "-" + event.logIndex.toString())

  transfer.from = event.params.from;
  transfer.account = event.params.from.toHex();
  transfer.to = event.params.to;
  transfer.value = event.params.value.toBigDecimal( / 10);
  transfer.save();

  let account = new Account(transfer.account);
  account.save();
}

function getBenzeneInstance(address: Address): Benzene {
  return Benzene.bind(address);
}