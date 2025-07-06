use sha2::{Digest, Sha256};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn solve(nonce: &[u8], target: &[u8]) -> Box<[u8]> {
    let mut buf = vec![0u8; 8 + nonce.len()];
    buf[8..].copy_from_slice(nonce);

    for i in 0u64.. {
        let i_bytes = u64::to_le_bytes(i);
        buf[0..=7].copy_from_slice(&i_bytes);
        let hash = Sha256::digest(&buf);
        if &hash[0..target.len()] == target {
            return i_bytes.into();
        }
    }

    unreachable!();
}

#[cfg(test)]
mod tests {
    #[test]
    fn solve() {
        assert_eq!(
            super::solve(&[1, 2], &[3, 4]).as_ref(),
            [45, 176, 0, 0, 0, 0, 0, 0]
        );
    }
}
