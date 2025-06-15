import { createUseReadContract } from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Wagmipet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xecb504d39723b0be0e3a9aa33d646642d1051ee1)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x0000000000000000000000000000000000000000)
 */
export const wagmipetAbi = [
  {
    type: 'function',
    inputs: [{ name: '_address', type: 'address' }],
    name: 'love',
    outputs: [{ name: 'loveAmount', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xecb504d39723b0be0e3a9aa33d646642d1051ee1)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x0000000000000000000000000000000000000000)
 */
export const wagmipetAddress = {
  1: '0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1',
  137: '0x0000000000000000000000000000000000000000',
  43114: '0x0000000000000000000000000000000000000000',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xecb504d39723b0be0e3a9aa33d646642d1051ee1)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x0000000000000000000000000000000000000000)
 */
export const wagmipetConfig = {
  address: wagmipetAddress,
  abi: wagmipetAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wagmipetAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xecb504d39723b0be0e3a9aa33d646642d1051ee1)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x0000000000000000000000000000000000000000)
 */
export const useReadWagmipet = /*#__PURE__*/ createUseReadContract({
  abi: wagmipetAbi,
  address: wagmipetAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wagmipetAbi}__ and `functionName` set to `"love"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xecb504d39723b0be0e3a9aa33d646642d1051ee1)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x0000000000000000000000000000000000000000)
 */
export const useReadWagmipetLove = /*#__PURE__*/ createUseReadContract({
  abi: wagmipetAbi,
  address: wagmipetAddress,
  functionName: 'love',
})
