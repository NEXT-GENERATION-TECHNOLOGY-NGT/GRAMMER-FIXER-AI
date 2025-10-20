import pandas as pd
import re
import os

class YourGrammarCorrector:
    def __init__(self):
        self.corrections = {}
        self.load_your_dataset()
        self.analyze_dataset_coverage()
    
    def load_your_dataset(self):
        """Load ONLY from your dataset - no hardcoded rules"""
        try:
            df = pd.read_csv("Grammar Correction.csv")
            print(f" Loaded YOUR dataset with {len(df)} rows")
            
            
            self.corrections = {}
            
            for index, row in df.iterrows():
                try:
                    wrong = str(row['Ungrammatical Statement']).strip().lower()
                    right = str(row['Standard English']).strip()
                    
                    
                    if wrong and right and wrong != right:
                        self.corrections[wrong] = right
                        
                except Exception as e:
                    continue  
            
            print(f"📚 Loaded {len(self.corrections)} correction rules from YOUR dataset")
            
        except Exception as e:
            print(f" Error loading YOUR dataset: {e}")
            self.corrections = {}
    
    def analyze_dataset_coverage(self):
        """Show what types of errors are in YOUR dataset"""
        if not self.corrections:
            return
            
        print("\n🔍 ANALYZING YOUR DATASET:")
        print("-" * 40)
        
        # Count error types
        verb_errors = 0
        subject_verb_errors = 0
        article_errors = 0
        preposition_errors = 0
        
        for wrong in self.corrections.keys():
            if any(phrase in wrong for phrase in [' is ', ' are ', ' was ', ' were ', ' have ', ' has ', ' do ', ' does ']):
                verb_errors += 1
            if any(word in wrong for word in ['goes', 'go ', 'want', 'like', 'need']):
                subject_verb_errors += 1
            if ' a ' in wrong or ' an ' in wrong or ' the ' in wrong:
                article_errors += 1
            if any(prep in wrong for prep in [' in ', ' on ', ' at ', ' to ', ' for ']):
                preposition_errors += 1
        
        print(f"📊 Verb tense errors: {verb_errors}")
        print(f"📊 Subject-verb agreement: {subject_verb_errors}") 
        print(f"📊 Article usage: {article_errors}")
        print(f"📊 Preposition errors: {preposition_errors}")
        
        # Show some examples from YOUR dataset
        print(f"\n📖 Sample corrections from YOUR dataset:")
        sample_count = 0
        for wrong, right in list(self.corrections.items())[:5]:
            print(f"   '{wrong}' → '{right}'")
            sample_count += 1
    
    def correct_using_only_your_dataset(self, sentence):
        """Use ONLY your dataset - no external rules"""
        if not self.corrections:
            return sentence
            
        original = sentence
        sentence_lower = sentence.lower().strip()
        
        print(f"\n🔎 Checking: '{sentence}'")
        print(f"   Looking in {len(self.corrections)} dataset rules...")
        
        # 1. Exact match in your dataset
        if sentence_lower in self.corrections:
            correction = self.corrections[sentence_lower]
            print(f"    FOUND EXACT MATCH: '{sentence_lower}' → '{correction}'")
            return correction
        
        # 2. Partial matches in your dataset
        matches_found = []
        for wrong, right in self.corrections.items():
            # Use word boundaries for better matching
            pattern = r'\b' + re.escape(wrong) + r'\b'
            if re.search(pattern, sentence_lower):
                matches_found.append((wrong, right))
        
        if matches_found:
            # Use the longest match (most specific)
            best_match = max(matches_found, key=lambda x: len(x[0]))
            wrong, right = best_match
            corrected = re.sub(r'\b' + re.escape(wrong) + r'\b', right, sentence, flags=re.IGNORECASE)
            print(f"    FOUND PARTIAL MATCH: '{wrong}' → '{right}'")
            return corrected
        
        print(f"    NO MATCH found in your dataset")
        return original
    
    def search_similar_in_dataset(self, sentence):
        """Search for similar patterns in your dataset"""
        if not self.corrections:
            return []
            
        sentence_lower = sentence.lower()
        similar = []
        
        for wrong, right in self.corrections.items():
            # Check if this correction might be relevant
            words_in_common = set(sentence_lower.split()) & set(wrong.split())
            if len(words_in_common) >= 2:  # At least 2 words in common
                similar.append((wrong, right, len(words_in_common)))
        
        # Sort by most words in common
        similar.sort(key=lambda x: x[2], reverse=True)
        return similar[:3]  # Return top 3

def main():
    print("🚀 YOUR DATASET GRAMMAR CORRECTOR")
    print("=" * 60)
    
    # Initialize using ONLY your dataset
    corrector = YourDatasetCorrector()
    
    if not corrector.corrections:
        print(" Cannot continue - no dataset loaded")
        return
    
    # Test specific cases including "she is want"
    test_cases = [
        "she is want",  # Your example
        "I goes to the store",
        "They was playing", 
        "She have completed",
        "he don't know",
        "in friday i will go"
    ]
    
    print("\n🧪 TESTING WITH YOUR DATASET ONLY:")
    print("=" * 50)
    
    for sentence in test_cases:
        print(f"\n" + "="*40)
        corrected = corrector.correct_using_only_your_dataset(sentence)
        
        if sentence != corrected:
            print(f" FINAL RESULT: '{sentence}' → '{corrected}'")
        else:
            print(f" NO CORRECTION: '{sentence}'")
            
            # Show similar patterns from your dataset
            similar = corrector.search_similar_in_dataset(sentence)
            if similar:
                print(f"   💡 Similar patterns in your dataset:")
                for wrong, right, score in similar:
                    print(f"      - '{wrong}' → '{right}'")
    
    # Interactive mode focused on your dataset
    print("\n" + "="*60)
    print("💬 INTERACTIVE MODE - Using YOUR DATASET")
    print("Type 'quit' to exit, 'search' to find patterns")
    print("="*60)
    
    while True:
        try:
            user_input = input("\n📝 Enter sentence: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                break
            
            if user_input.lower() == 'search':
                # Let user search for patterns
                search_term = input("Enter word or phrase to search in dataset: ").lower()
                matches = []
                for wrong, right in corrector.corrections.items():
                    if search_term in wrong:
                        matches.append((wrong, right))
                
                if matches:
                    print(f"\n🔍 Found {len(matches)} matches for '{search_term}':")
                    for wrong, right in matches[:10]:  # Show first 10
                        print(f"   '{wrong}' → '{right}'")
                else:
                    print(f" No matches found for '{search_term}'")
                continue
            
            if not user_input:
                continue
            
            print(f"\n" + "="*40)
            corrected = corrector.correct_using_only_your_dataset(user_input)
            
            if user_input != corrected:
                print(f"FINAL: '{user_input}' → '{corrected}'")
            else:
                print(f" No correction applied")
                
                # Show why no match was found
                similar = corrector.search_similar_in_dataset(user_input)
                if similar:
                    print(f"💡 Close matches in your dataset:")
                    for wrong, right, score in similar:
                        print(f"   '{wrong}' → '{right}'")
                else:
                    print(f"💡 No similar patterns found in your dataset")
                    print(f"   This error might not be covered in your dataset")
                    
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f" Error: {e}")

if __name__ == "__main__":
    main()