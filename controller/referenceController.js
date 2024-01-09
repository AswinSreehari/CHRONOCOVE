const  collection = require('../models/user')
const walletCollection = require('../models/wallet')
const referenceColleciton = require('../models/reference')


const claimReferenceCode = async (req, res) => {
    try {
        console.log("inside the tryyy!!!!")
      const { referenceCode } = req.body;
      const reference = await referenceColleciton.findOne({ referenceCode });
      console.log("the reference code is :",reference)
      if (!reference) {
        return res.status(400).json({ message: "Invalid reference code" });
      }
  
      const user = await collection
        .findOne({ emailId: req.session.email })
        .populate("wallet");

        console.log("User:",user.wallet)
  
      if (!user) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
  
      // Check if the reference code has already been used by the current user
      if (reference.usedBy.includes(user._id)) {
        return res.status(400).json({ message: "Reference code already used" });
      }

      if (reference.userId.equals(user._id)) {
        return res.status(400).json({ message: "Cannot claim your own referral code" });
      }
  
      // Mark the reference code as used by the current user
      reference.usedBy.push(user._id);
      await reference.save();
  
      // Increase wallet balances
      if (user.wallet) {
        // Add the credited amount to the wallet transactions
        user.wallet.transactions.push({
          amount: 100,
          type: 'Credit',
        });
  
        user.wallet.balance += 100; // Increase user's wallet by 100 rupees
        await user.wallet.save();
      } else {
        const newWallet = new walletCollection({ balance: 100 });
        // Add the credited amount to the wallet transactions
        newWallet.transactions.push({
          amount: 100,
          type: 'Credit',
        });
  
        await newWallet.save();
        user.wallet = newWallet;
      }
  
      // Increase session user's wallet balance
      const referenceuser = await collection
        .findById(reference.userId)
        .populate("wallet");
  
      if (referenceuser.wallet) {
        // Add the credited amount to the wallet transactions
        referenceuser.wallet.transactions.push({
          amount: 100,
          type: 'Credit',
        });
  
        referenceuser.wallet.balance += 100; // Increase user's wallet by 100 rupees
        await referenceuser.wallet.save();
      } else {
        const newWallet = new walletCollection({ balance: 100 });
        // Add the credited amount to the wallet transactions
        newWallet.transactions.push({
          amount: 100,
          type: 'Credit',
        });
  
        await newWallet.save();
        referenceuser.wallet = newWallet;
      }
  
      await user.save();
  
      return res
        .status(200)
        .json({ message: "Reference code claimed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  module.exports = {
    claimReferenceCode
  }