import test from 'node:test';
import assert from 'node:assert/strict';
import { offers, qaCases, getOffer, scoreExample, filterIssues, createBrief } from './services.mjs';

test('all offers have clear outputs, scope and their own Fiverr route', () => {
  assert.equal(Object.keys(offers).length, 3);
  for (const offer of Object.values(offers)) {
    assert.equal(offer.output.length, 3);
    assert.equal(offer.scope.length, 3);
    assert.match(offer.gig, /^https:\/\/www\.fiverr\.com\/dhairya_sharma5\//);
    assert.ok(offer.boundary.length > 100);
  }
});
test('invalid offer keys use the safe default', () => {
  assert.equal(getOffer('unknown'), offers.qa);
  assert.equal(getOffer('constructor'), offers.qa);
  assert.equal(getOffer('__proto__'), offers.qa);
  assert.equal(getOffer('toString'), offers.qa);
});
test('critical failures take precedence over a high score', () => {
  assert.deepEqual(scoreExample({scores:[5,5,5],critical:true}), {score:'5.0',verdict:'Needs correction'});
  assert.equal(scoreExample(qaCases.refund.draft).score, '2.1');
  assert.equal(scoreExample(qaCases.refund.revised).score, '4.8');
});
test('every authored draft flags a critical error and revision clears it', () => {
  for (const example of Object.values(qaCases)) {
    assert.equal(example.draft.critical,true);
    assert.equal(example.revised.critical,false);
  }
});
test('issue filters do not fabricate results', () => {
  assert.equal(filterIssues('All').length,4);
  assert.equal(filterIssues('High').length,2);
  assert.equal(filterIssues('Medium').length,1);
  assert.equal(filterIssues('Investigate').length,1);
  assert.equal(filterIssues('Unknown').length,0);
});
test('brief uses selected offer and preserves text literally', () => {
  const brief=createBrief({service:'web',scope:offers.web.scope[1],timing:'Within a month',context:'<img src=x onerror=alert(1)>'});
  assert.match(brief,/Responsive landing page/);
  assert.match(brief,/Improve an existing page/);
  assert.ok(brief.includes('<img src=x onerror=alert(1)>'));
  assert.match(brief,/not an order or agreement/);
});
test('brief clamps text and rejects invalid structured options', () => {
  const brief=createBrief({service:'seo',scope:'injected option',timing:'tomorrow guaranteed',context:'a'.repeat(900)});
  assert.ok(!brief.includes('injected option'));
  assert.ok(!brief.includes('tomorrow guaranteed'));
  assert.ok(brief.includes('a'.repeat(600)));
  assert.ok(!brief.includes('a'.repeat(601)));
});
