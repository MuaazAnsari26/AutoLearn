import urllib.request
import json

def run_demo():
    print("--- Phase 9 Final Acceptance Verification ---")
    
    # 1. Generate 100 examples for contains substring 01
    gen_payload = {
        'language_id': 'contains_01',
        'sample_count': 100,
        'min_length': 0,
        'max_length': 10,
        'positive_ratio': 0.5,
        'noise_rate': 0.0,
        'seed': 42
    }
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/datasets/generate',
        data=json.dumps(gen_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        dataset = json.loads(resp.read().decode('utf-8'))
    print(f"1. Dataset generated: {len(dataset['samples'])} samples")
    
    pos = [s['string'] for s in dataset['samples'] if s['label'] == 1]
    neg = [s['string'] for s in dataset['samples'] if s['label'] == 0]
    print(f"   Positives: {len(pos)}, Negatives: {len(neg)}")
    
    # 2. Learn DFA using RPNI
    learn_payload = {
        'alphabet': ['0', '1'],
        'positive_examples': pos,
        'negative_examples': neg,
        'algorithm': 'rpni',
        'minimize_result': True
    }
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/automata/learn',
        data=json.dumps(learn_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        learned = json.loads(resp.read().decode('utf-8'))
    dfa = learned['automaton']
    print(f"2. Learned DFA via RPNI:")
    print(f"   States: {dfa['states']}")
    print(f"   Start state: {dfa['start_state']}")
    print(f"   Accept states: {dfa['accept_states']}")
    print(f"   Transitions: {dfa['transitions']}")
    print(f"   Training consistency: {learned['training_consistency']}")
    
    # 3. Simulate 1101
    sim1_payload = {'automaton': dfa, 'input_string': '1101'}
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/automata/simulate',
        data=json.dumps(sim1_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        sim1 = json.loads(resp.read().decode('utf-8'))
    print(f"3. Simulate '1101': accepted = {sim1['accepted']} (final state: {sim1['final_state']}, steps: {len(sim1['steps'])})")
    
    # 4. Simulate 111
    sim2_payload = {'automaton': dfa, 'input_string': '111'}
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/automata/simulate',
        data=json.dumps(sim2_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        sim2 = json.loads(resp.read().decode('utf-8'))
    print(f"4. Simulate '111': accepted = {sim2['accepted']} (final state: {sim2['final_state']}, steps: {len(sim2['steps'])})")
    
    # 5. DFA Equivalence check against reference DFA
    req = urllib.request.Request('http://127.0.0.1:8000/api/automata/reference/contains_01')
    with urllib.request.urlopen(req) as resp:
        ref_resp = json.loads(resp.read().decode('utf-8'))
        ref_dfa = ref_resp['automaton']
    
    equiv_payload = {'dfa1': dfa, 'dfa2': ref_dfa}
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/automata/equivalence',
        data=json.dumps(equiv_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        equiv = json.loads(resp.read().decode('utf-8'))
    print(f"5. Exact DFA Equivalence with reference DFA:")
    print(f"   Equivalent: {equiv['equivalent']}")
    print(f"   Distinguishing string: {equiv.get('distinguishing_string')}")
    print(f"   States explored: {equiv.get('states_explored')}")
    print(f"   Explanation: {equiv.get('explanation')}")
    
    # 6. Real Training-Size Experiment
    exp_payload = {
        'language_id': 'contains_01',
        'sample_sizes': [10, 25, 50, 100],
        'test_size': 50,
        'seed': 42
    }
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/experiments/training-size',
        data=json.dumps(exp_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        exp = json.loads(resp.read().decode('utf-8'))
    print("6. Real Training-Size Experiment results:")
    for r in exp['results']:
        sz = r['training_size']
        acc = r['test_accuracy']
        st = r['inferred_states']
        f1 = r['test_f1']
        eq = r['is_equivalent_to_reference']
        print(f"   Training Size {sz:3d}: Test Acc = {acc:.2f}, F1 = {f1:.2f}, Inferred States = {st}, Reference Equivalent = {eq}")

if __name__ == '__main__':
    run_demo()
