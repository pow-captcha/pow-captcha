extern crate wee_alloc;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use sha2::{Digest, Sha256};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn solve(nonce: Box<[u8]>, target: Box<[u8]>, difficulty_bits: u32) -> Box<[u8]> {
    let mut buf = vec![0u8; 8 + nonce.len()];
    buf[8..].copy_from_slice(&nonce);

    let target_whole_bytes = &target[0..(difficulty_bits as usize / 8)];

    let target_rest = {
        let rest_bits = difficulty_bits % 8;
        match rest_bits {
            0 => None,
            _ => {
                let mask = 0xffu8.unbounded_shl(8 - rest_bits);
                let rest = target[target_whole_bytes.len()] & mask;
                Some((mask, rest))
            }
        }
    };

    for i in 0u64.. {
        let i_bytes = u64::to_le_bytes(i);
        buf[0..=7].copy_from_slice(&i_bytes);
        let hash = Sha256::digest(&buf);

        if &hash[0..target_whole_bytes.len()] == target_whole_bytes {
            let target_rest_ok = match target_rest {
                None => true,
                Some((mask, rest)) => (hash[target_whole_bytes.len()] & mask) == rest,
            };
            if target_rest_ok {
                return i_bytes.into();
            }
        }
    }

    unreachable!();
}

#[cfg(test)]
mod tests {
    #[test]
    fn solve() {
        assert_eq!(
            super::solve([1, 2].into(), [3, 4, 5].into(), 18).as_ref(),
            [45, 176, 0, 0, 0, 0, 0, 0]
        );
    }
}
