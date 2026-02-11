module cetus_copilot::strategy_nft {
    use std::string::{Self, String};

    /// Strategy NFT records LP strategy configuration for tracking.
    public struct StrategyNFT has key, store {
        id: UID,
        pool_id: address,
        lower_tick: u32,
        upper_tick: u32,
        initial_price: u64,
        amount_usd: u64,
        strategy_type: u8,  // 0=narrow, 1=medium, 2=wide
        risk_score: u8,     // 0=LOW, 1=MEDIUM, 2=HIGH
        created_at: u64,
        name: String,
        description: String,
    }

    /// Mint a new Strategy NFT
    public fun mint(
        pool_id: address,
        lower_tick: u32,
        upper_tick: u32,
        initial_price: u64,
        amount_usd: u64,
        strategy_type: u8,
        risk_score: u8,
        created_at: u64,
        ctx: &mut TxContext,
    ): StrategyNFT {
        let name = if (strategy_type == 0) {
            string::utf8(b"Narrow Range Strategy")
        } else if (strategy_type == 1) {
            string::utf8(b"Medium Range Strategy")
        } else {
            string::utf8(b"Wide Range Strategy")
        };

        let description = string::utf8(b"Cetus LP Risk Copilot Strategy NFT");

        StrategyNFT {
            id: object::new(ctx),
            pool_id,
            lower_tick,
            upper_tick,
            initial_price,
            amount_usd,
            strategy_type,
            risk_score,
            created_at,
            name,
            description,
        }
    }

    /// Mint and transfer to sender
    #[allow(lint(public_entry))]
    public entry fun mint_and_transfer(
        pool_id: address,
        lower_tick: u32,
        upper_tick: u32,
        initial_price: u64,
        amount_usd: u64,
        strategy_type: u8,
        risk_score: u8,
        created_at: u64,
        ctx: &mut TxContext,
    ) {
        let nft = mint(
            pool_id, lower_tick, upper_tick, initial_price,
            amount_usd, strategy_type, risk_score, created_at, ctx,
        );
        transfer::public_transfer(nft, tx_context::sender(ctx));
    }

    /// Read accessors
    public fun pool_id(nft: &StrategyNFT): address { nft.pool_id }
    public fun strategy_type(nft: &StrategyNFT): u8 { nft.strategy_type }
    public fun amount_usd(nft: &StrategyNFT): u64 { nft.amount_usd }
    public fun name(nft: &StrategyNFT): &String { &nft.name }
}
