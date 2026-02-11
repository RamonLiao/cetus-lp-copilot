#[test_only]
module cetus_copilot::strategy_nft_tests {
    use cetus_copilot::strategy_nft;
    use std::unit_test;

    #[test]
    fun test_mint_narrow() {
        let mut ctx = tx_context::dummy();
        let nft = strategy_nft::mint(
            @0x1, 100, 200, 3500, 1000, 0, 1, 1000000, &mut ctx,
        );
        assert!(strategy_nft::strategy_type(&nft) == 0);
        assert!(strategy_nft::amount_usd(&nft) == 1000);
        assert!(strategy_nft::pool_id(&nft) == @0x1);
        unit_test::destroy(nft);
    }

    #[test]
    fun test_mint_wide() {
        let mut ctx = tx_context::dummy();
        let nft = strategy_nft::mint(
            @0x2, 50, 500, 3500, 5000, 2, 2, 2000000, &mut ctx,
        );
        assert!(strategy_nft::strategy_type(&nft) == 2);
        unit_test::destroy(nft);
    }

    #[test]
    fun test_mint_and_transfer() {
        let mut ctx = tx_context::dummy();
        strategy_nft::mint_and_transfer(
            @0x3, 75, 300, 3500, 2000, 1, 0, 3000000, &mut ctx,
        );
    }
}
