import { motion } from 'framer-motion';
import {
  Shield, Wallet, Key, AlertTriangle, Lock, Globe,
  FileText, Users, Zap, EyeOff, Server, Database,
  Scale, Gavel, Rocket, Sparkles, Code, Link,
  UserX, Cpu
} from 'lucide-react';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
};

const SwytchDisclosure = () => {
  return (
    <section className="py-32 px-6 lg:px-24 bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-gray-100 text-left overflow-hidden">
      <motion.div
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-32"
      >
        {/* Section 1: Terms of Use */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col lg:flex-row items-center gap-12"
        >
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <FileText className="text-blue-400 w-12 h-12 animate-pulse" /> Terms of Use
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              To interact with the Swytch Private Energy Trust Protocol using the Interface, you will need to connect and engage with it through your self-custodial wallet. It's essential to understand that your self-custodial wallet is provided by a third-party entity and is generally governed by separate terms and conditions set by the respective third-party service provider.
            </p>
            <ul className="list-none space-y-4 text-lg text-gray-300">
              <li className="flex items-start gap-3"><Wallet className="text-teal-400 w-6 h-6" /> Review third-party wallet terms for fees, disclaimers, and risks.</li>
              <li className="flex items-start gap-3"><Shield className="text-green-400 w-6 h-6" /> Swytch is not an intermediary, agent, advisor, or custodian.</li>
              <li className="flex items-start gap-3"><Zap className="text-yellow-400 w-6 h-6" /> Blockchain transactions may incur non-refundable gas fees.</li>
            </ul>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-blue-500/30 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">Your self-custodial wallet is your responsibility—ensure compliance with its terms.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 2: Assumption of Risk */}
        <motion.div
          variants={fadeRight}
          className="relative bg-gray-900/30 p-10 rounded-2xl shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl" />
          <div className="relative space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <AlertTriangle className="text-red-400 w-12 h-12" /> Assumption of Risk
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              You assume the risks of engaging in novel and experimental technology. Technologies such as smart contracts, cryptographic tokens, and blockchain-based systems are experimental, speculative, and inherently risky.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-lg text-gray-300">
              <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                <Code className="text-orange-400 w-6 h-6" /> Bugs, malfunctions, or cyberattacks may disrupt operations.
              </li>
              <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                <Link className="text-yellow-400 w-6 h-6" /> Blockchain changes (e.g., forks) could result in total loss.
              </li>
              <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                <Lock className="text-red-400 w-6 h-6" /> Swytch assumes no liability for these risks.
              </li>
              <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                <Server className="text-purple-400 w-6 h-6" /> Third-party services or links are not Swytch’s responsibility.
              </li>
            </ul>
            <p className="text-xl text-orange-300 italic">If uncomfortable with these risks, do not use blockchain technology.</p>
          </div>
        </motion.div>

        {/* Section 3: Smart Contract Transactions */}
        <motion.div
          variants={fadeLeft}
          className="flex flex-col lg:flex-row-reverse items-center gap-12"
        >
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Cpu className="text-teal-400 w-12 h-12 animate-pulse" /> Smart Contract Transactions
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              All transactions on the Swytch Private Energy Trust are automatically processed using smart contracts. By engaging, you consent to this automated processing and acknowledge that smart contracts dictate fund distribution and asset ownership.
            </p>
            <ul className="list-none space-y-4 text-lg text-gray-300">
              <li className="flex items-start gap-3"><Rocket className="text-cyan-400 w-6 h-6" /> Transactions are irreversible, final, and non-refundable.</li>
              <li className="flex items-start gap-3"><Key className="text-green-400 w-6 h-6" /> You bear sole responsibility for evaluating risks before transacting.</li>
            </ul>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-teal-500/30 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">Smart contracts ensure trustless execution but require your informed consent.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 4: Wallet Security */}
        <motion.div
          variants={fadeUp}
          className="space-y-10 text-center bg-gradient-to-b from-gray-900/50 to-gray-800/50 p-10 rounded-2xl shadow-2xl"
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
            <Key className="text-yellow-400 w-12 h-12" /> Wallet Security
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            You are solely responsible for maintaining the security of your self-custodial wallet. Swytch does not have access to your private keys, and unauthorized access by third parties could result in loss or theft of assets.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
              <Lock className="text-red-400 w-8 h-8 mx-auto mb-4" />
              <p className="text-lg text-gray-200">Secure your private keys—Swytch cannot recover lost access.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
              <UserX className="text-purple-400 w-8 h-8 mx-auto mb-4" />
              <p className="text-lg text-gray-200">You alone manage wallet security, not Swytch.</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Section 5: Service Accessibility */}
        <motion.div
          variants={fadeRight}
          className="flex flex-col lg:flex-row items-center gap-12"
        >
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Server className="text-purple-400 w-12 h-12 animate-pulse" /> Service Accessibility
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Swytch does not guarantee the quality or accessibility of its services. You access and use the platform at your own risk and must conduct due diligence into transaction risks, smart contracts, and cryptocurrency assets.
            </p>
            <p className="text-xl text-purple-300 italic">Use Swytch only if suitable for your financial circumstances.</p>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-purple-500/30 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">Your due diligence is critical—Swytch services may face disruptions.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 6: Taxes */}
        <motion.div
          variants={fadeLeft}
          className="relative bg-gray-900/30 p-10 rounded-2xl shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl" />
          <div className="relative space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Scale className="text-green-400 w-12 h-12" /> Taxes
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Income beneficiaries bear sole responsibility for paying any taxes, duties, and assessments associated with their use of Swytch services or cryptocurrency assets.
            </p>
            <ul className="list-none space-y-4 text-lg text-gray-300">
              <li className="flex items-start gap-3"><Database className="text-teal-400 w-6 h-6" /> Tax treatment of blockchain transactions is uncertain.</li>
              <li className="flex items-start gap-3"><Sparkles className="text-yellow-400 w-6 h-6" /> See the “Know Your Freedom” section for tax education.</li>
            </ul>
            <p className="text-xl text-teal-300 italic">You are responsible for all tax obligations.</p>
          </div>
        </motion.div>

        {/* Section 7: Prohibited Content */}
        <motion.div
          variants={fadeUp}
          className="space-y-10 text-center"
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
            <Gavel className="text-red-400 w-12 h-12 animate-pulse" /> Prohibited Content
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            You may only use Swytch if you comply with its Agreement, third-party policies, and all applicable laws. The following conduct is prohibited:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
              <UserX className="text-red-400 w-8 h-8 mx-auto mb-4" />
              <p className="text-sm text-gray-200">Illegal activities (e.g., money laundering, tax evasion).</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
              <Code className="text-orange-400 w-8 h-8 mx-auto mb-4" />
              <p className="text-sm text-gray-200">Uploading malicious code (e.g., viruses, malware).</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
              <Link className="text-purple-400 w-8 h-8 mx-auto mb-4" />
              <p className="text-sm text-gray-200">Unauthorized commercial use or data harvesting.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
              <Cpu className="text-teal-400 w-8 h-8 mx-auto mb-4" />
              <p className="text-sm text-gray-200">Interfering with security or smart contracts.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
              <Users className="text-yellow-400 w-8 h-8 mx-auto mb-4" />
              <p className="text-sm text-gray-200">Anticompetitive behavior or misconduct.</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Section 8: DSPET Disclosure */}
        <motion.div
          variants={fadeRight}
          className="flex flex-col lg:flex-row items-center gap-12"
        >
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Globe className="text-cyan-400 w-12 h-12" /> DSPET Disclosure
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              The Decentralized Swytch Private Energy Trust (DSPET) facilitates transparent, secure, and private energy exchange among members and depositors using blockchain technology.
            </p>
            <ul className="list-none space-y-4 text-lg text-gray-300">
              <li className="flex items-start gap-3"><Rocket className="text-blue-400 w-6 h-6" /> Enables trustless energy exchange (e.g., JEWELS).</li>
              <li className="flex items-start gap-3"><Users className="text-green-400 w-6 h-6" /> Governed by a decentralized community with SWYTCH tokens.</li>
              <li className="flex items-start gap-3"><Shield className="text-teal-400 w-6 h-6" /> Smart contracts are audited for security.</li>
            </ul>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-cyan-500/30 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">DSPET revolutionizes energy exchange with decentralization and privacy.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 9: DSPET Privacy Statement */}
        <motion.div
          variants={fadeLeft}
          className="relative bg-gray-900/30 p-10 rounded-2xl shadow-xl text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl" />
          <div className="relative space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
              <EyeOff className="text-pink-400 w-12 h-12 animate-pulse" /> DSPET Privacy Statement
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              DSPET is committed to safeguarding your privacy. It does not collect registration information, transaction data, user preferences, or device information.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <Database className="text-purple-400 w-8 h-8 mx-auto mb-4" />
                <p className="text-lg text-gray-200">No data is used for platform operations or analytics.</p>
              </motion.div>
              <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <Users className="text-pink-400 w-8 h-8 mx-auto mb-4" />
                <p className="text-lg text-gray-200">Your privacy is protected with encryption and pseudonymization.</p>
              </motion.div>
            </div>
            <p className="text-xl text-pink-300 italic">By using DSPET, you consent to its privacy practices.</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SwytchDisclosure;