const mongoose = require('mongoose');
const collection = require('../models/user');
const walletCollection = require('../models/wallet');

const walletHistory = async (req, res) => {
    if (req.session.email) {
      console.log("the user email is:",req.session.email)
        try {
            const user = await collection.findOne({ emailId: req.session.email }).populate('wallet');

            if (!user) {
                return res.redirect('/error');
            }

            const walletData = await walletCollection.aggregate([
                {
                    $match: { _id: user.wallet._id }
                },
                {
                    $unwind: '$transactions'
                },
                {
                    $sort: { 'transactions.date': -1 } // Sort by date in descending order
                },
                {
                    $limit: 10 // Limit to the most recently made ten transactions
                },
                {
                    $project: {
                        date: '$transactions.date',
                        amount: '$transactions.amount',
                        type: {
                            $cond: {
                                if: { $gt: ['$transactions.amount', 0] },
                                then: 'Credit',
                                else: 'Debit'
                            }
                        }
                    }
                }
            ]);

            const transactions = walletData.map(transaction => ({
                date: transaction.date,
                amount: transaction.amount,
                type: transaction.type
            }));

            res.render('user/walletHistory', { transactions });
        } catch (error) {
            console.error(error);
            res.redirect("/error");
        }
    } else {
        res.redirect('/signin');
    }
};

module.exports = {
    walletHistory
};
