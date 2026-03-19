# source_id: source_01_paper

# Formal Digest: Speculative Decoding

Speculative decoding is an exact decoding acceleration method. A drafter proposes candidate tokens, and the target model verifies them before commitment.

This is not a cache-only trick. The target model still matters because the exactness guarantee comes from the verification step.
