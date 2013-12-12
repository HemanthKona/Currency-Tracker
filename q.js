use 'currency';

db.transactions.aggregate({
	{ $match: { user: 'hemanth@gmail.com', groupId: 52a955791d88578018000002}}
});