var assert = require('assert'),
	vows = require('vows');

vows.describe('game')
	.addBatch({
		simple: {
			topic: function() { return 5; },
			'should equal 5': function(topic) {
				assert.equal(topic, 5);
			}
		}
	})
	.export(module);
