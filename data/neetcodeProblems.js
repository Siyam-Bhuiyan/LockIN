// Complete NeetCode 150 Problems Database
export const neetCodeProblems = [
  // Array & Hashing
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array & Hashing",
    leetcodeUrl: "https://leetcode.com/problems/two-sum/",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    detailedDescription: `You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
• 2 <= nums.length <= 104
• -109 <= nums[i] <= 109
• -109 <= target <= 109
• Only one valid answer exists.`,
    hints: [
      "A really brute force way would be to search for all possible pairs of numbers but that would be too slow.",
      "A better way is to use a hash map to store the numbers we've seen so far.",
      "For each number, check if target - current number exists in the hash map.",
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    tags: ["Array", "Hash Table"],
    companies: ["Amazon", "Google", "Apple", "Microsoft", "Facebook"],
    followUp:
      "Can you come up with an algorithm that is less than O(n²) time complexity?",
  },
  {
    id: 2,
    title: "Contains Duplicate",
    difficulty: "Easy",
    category: "Array & Hashing",
    leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/",
    description:
      "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    detailedDescription: `Example 1:
Input: nums = [1,2,3,1]
Output: true

Example 2:
Input: nums = [1,2,3,4]
Output: false

Example 3:
Input: nums = [1,1,1,3,3,4,3,2,4,2]
Output: true

Constraints:
• 1 <= nums.length <= 105
• -109 <= nums[i] <= 109`,
    hints: [
      "Use a hash set to track seen elements.",
      "If you encounter an element that's already in the set, return true.",
      "If you finish the array without duplicates, return false.",
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    tags: ["Array", "Hash Table", "Sorting"],
    companies: ["Amazon", "Apple", "Adobe"],
    followUp: "Can you solve this problem in O(1) extra space complexity?",
  },
  {
    id: 3,
    title: "Valid Anagram",
    difficulty: "Easy",
    category: "Array & Hashing",
    leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
    description:
      "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    detailedDescription: `An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

Example 1:
Input: s = "anagram", t = "nagaram"
Output: true

Example 2:
Input: s = "rat", t = "car"
Output: false

Constraints:
• 1 <= s.length, t.length <= 5 * 104
• s and t consist of lowercase English letters.`,
    hints: [
      "Count the frequency of each character in both strings.",
      "Compare the frequency maps.",
      "Alternatively, sort both strings and compare.",
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["Hash Table", "String", "Sorting"],
    companies: ["Amazon", "Bloomberg", "Facebook"],
    followUp:
      "What if the inputs contain Unicode characters? How would you adapt your solution to handle this case?",
  },
  {
    id: 4,
    title: "Group Anagrams",
    difficulty: "Medium",
    category: "Array & Hashing",
    leetcodeUrl: "https://leetcode.com/problems/group-anagrams/",
    description:
      "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
    detailedDescription: `An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

Example 1:
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]

Example 2:
Input: strs = [""]
Output: [[""]]

Example 3:
Input: strs = ["a"]
Output: [["a"]]

Constraints:
• 1 <= strs.length <= 104
• 0 <= strs[i].length <= 100
• strs[i] consists of lowercase English letters.`,
    hints: [
      "Use a hash map where the key is the sorted string.",
      "All anagrams will have the same sorted string as key.",
      "Group strings by their sorted representation.",
    ],
    timeComplexity: "O(N * K log K)",
    spaceComplexity: "O(N * K)",
    tags: ["Array", "Hash Table", "String", "Sorting"],
    companies: ["Amazon", "Facebook", "Uber", "Airbnb"],
    followUp: "How would you solve this if the strings were very long?",
  },
  {
    id: 5,
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    category: "Array & Hashing",
    leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
    description:
      "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
    detailedDescription: `Example 1:
Input: nums = [1,1,1,2,2,3], k = 2
Output: [1,2]

Example 2:
Input: nums = [1], k = 1
Output: [1]

Constraints:
• 1 <= nums.length <= 105
• k is in the range [1, the number of unique elements in the array].
• It is guaranteed that the answer is unique.`,
    hints: [
      "Count the frequency of each element using a hash map.",
      "Use a heap to get the top k frequent elements.",
      "Bucket sort approach: create buckets for each frequency.",
    ],
    timeComplexity: "O(n log k)",
    spaceComplexity: "O(n + k)",
    tags: [
      "Array",
      "Hash Table",
      "Divide and Conquer",
      "Sorting",
      "Heap",
      "Bucket Sort",
      "Counting",
      "Quickselect",
    ],
    companies: ["Amazon", "Facebook", "Yelp", "Pocket Gems"],
    followUp:
      "Your algorithm's time complexity must be better than O(n log n), where n is the array's size.",
  },

  // Two Pointers
  {
    id: 6,
    title: "Valid Palindrome",
    difficulty: "Easy",
    category: "Two Pointers",
    leetcodeUrl: "https://leetcode.com/problems/valid-palindrome/",
    description:
      "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
    detailedDescription: `Given a string s, return true if it is a palindrome, or false otherwise.

Example 1:
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.

Example 2:
Input: s = "race a car"
Output: false
Explanation: "raceacar" is not a palindrome.

Example 3:
Input: s = " "
Output: true
Explanation: s is an empty string "" after removing non-alphanumeric characters.

Constraints:
• 1 <= s.length <= 2 * 105
• s consists only of printable ASCII characters.`,
    hints: [
      "Use two pointers, one from the start and one from the end.",
      "Skip non-alphanumeric characters.",
      "Compare characters in lowercase.",
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["Two Pointers", "String"],
    companies: ["Facebook", "Microsoft", "Amazon"],
    followUp:
      "Could you solve it without converting the entire string to lowercase first?",
  },
  {
    id: 7,
    title: "Two Sum II - Input Array Is Sorted",
    difficulty: "Medium",
    category: "Two Pointers",
    leetcodeUrl:
      "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    description:
      "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.",
    detailedDescription: `Let these two numbers be numbers[index1] and numbers[index2] where 1 <= index1 < index2 <= numbers.length.

Return the indices of the two numbers, index1 and index2, added by one as an integer array [index1, index2] of length 2.

The tests are generated such that there is exactly one solution. You may not use the same element twice.

Your solution must use only constant extra space.

Example 1:
Input: numbers = [2,7,11,15], target = 9
Output: [1,2]
Explanation: The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2. We return [1, 2].

Example 2:
Input: numbers = [2,3,4], target = 6
Output: [1,3]
Explanation: The sum of 2 and 4 is 6. Therefore index1 = 1, index2 = 3. We return [1, 3].

Constraints:
• 2 <= numbers.length <= 3 * 104
• -1000 <= numbers[i] <= 1000
• numbers is sorted in non-decreasing order.
• -1000 <= target <= 1000
• The tests are generated such that there is exactly one solution.`,
    hints: [
      "Use two pointers at the beginning and end of the array.",
      "If sum is greater than target, move right pointer left.",
      "If sum is less than target, move left pointer right.",
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["Array", "Two Pointers", "Binary Search"],
    companies: ["Amazon", "Adobe", "Apple"],
    followUp: "Can you solve this in less than O(n) time complexity?",
  },
  {
    id: 8,
    title: "3Sum",
    difficulty: "Medium",
    category: "Two Pointers",
    leetcodeUrl: "https://leetcode.com/problems/3sum/",
    description:
      "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    detailedDescription: `Notice that the solution set must not contain duplicate triplets.

Example 1:
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
Explanation: 
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.
The distinct triplets are [-1,0,1] and [-1,-1,2].
Notice that the order of the output and the order of the triplets does not matter.

Example 2:
Input: nums = [0,1,1]
Output: []
Explanation: The only possible triplet does not sum up to 0.

Example 3:
Input: nums = [0,0,0]
Output: [[0,0,0]]
Explanation: The only possible triplet sums up to 0.

Constraints:
• 3 <= nums.length <= 3000
• -105 <= nums[i] <= 105`,
    hints: [
      "Sort the array first.",
      "Use a fixed pointer and two moving pointers.",
      "Skip duplicates to avoid duplicate triplets.",
    ],
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    tags: ["Array", "Two Pointers", "Sorting"],
    companies: ["Facebook", "Amazon", "Microsoft", "Adobe"],
    followUp: "Can you solve this problem in O(n²) time complexity?",
  },
  {
    id: 9,
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Two Pointers",
    leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
    description:
      "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).",
    detailedDescription: `Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

Notice that you may not slant the container.

Example 1:
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.

Example 2:
Input: height = [1,1]
Output: 1

Constraints:
• n == height.length
• 2 <= n <= 105
• 0 <= height[i] <= 104`,
    hints: [
      "Use two pointers at the beginning and end.",
      "Calculate area with current pointers.",
      "Move the pointer with smaller height inward.",
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["Array", "Two Pointers", "Greedy"],
    companies: ["Facebook", "Amazon", "Bloomberg", "Adobe"],
    followUp: "Can you solve this in O(n) time and O(1) space?",
  },

  // Sliding Window
  {
    id: 10,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Sliding Window",
    leetcodeUrl:
      "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    description:
      "You are given an array prices where prices[i] is the price of a given stock on the ith day.",
    detailedDescription: `You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

Example 1:
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.

Example 2:
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.

Constraints:
• 1 <= prices.length <= 105
• 0 <= prices[i] <= 104`,
    hints: [
      "Keep track of the minimum price seen so far.",
      "For each price, calculate profit if sold at current price.",
      "Update maximum profit as you go.",
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["Array", "Dynamic Programming"],
    companies: ["Amazon", "Microsoft", "Facebook", "Apple"],
    followUp: "Can you solve this problem in one pass?",
  },


{
    id: 11,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    leetcodeUrl:
    "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    description:
    "Given a string s, find the length of the longest substring without repeating characters.",
    detailedDescription: `Example 1:
    Input: s = "abcabcbb"
    Output: 3
    Explanation: The answer is "abc", with the length of 3.

    Example 2:
    Input: s = "bbbbb"
    Output: 1
    Explanation: The answer is "b", with the length of 1.

    Example 3:
    Input: s = "pwwkew"
    Output: 3
    Explanation: The answer is "wke", with the length of 3.
    Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.

    Constraints:
    • 0 <= s.length <= 50
    • s consists of English letters, digits, symbols and spaces.`,
    hints: [
      "Use a sliding window approach.",
      "Keep track of the characters in the current window.",
      "Update the maximum length as you go.",
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(min(n, m))",
    tags: ["String", "Sliding Window"],
    companies: ["Amazon", "Microsoft", "Facebook", "Apple"],
    followUp: "Can you solve this problem using a different approach?",
  },
  {
    id: 12,
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Two Pointers",
    leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
    description: "Given n non-negative integers a1, a2, ..., an , where each represents a point at coordinate (i, ai). n vertical lines are drawn such that the two endpoints of line i is at (i, ai) and (i, 0). Find two lines, which together with the x-axis forms a container, such that the container contains the most water.",
    detailedDescription: `Example 1:
    Input: height = [1,8,6,2,5,4,8,3,7]
    Output: 49
    Explanation: The max area is between height[1] and height[8]: 7 * (8 - 1) = 49.

    Example 2:
    Input: height = [1,1]
    Output: 1
    Explanation: The max area is 1 * (1 - 0) = 1.

    Constraints:
    • n == height.length
    • 2 <= n <= 105
    • 0 <= height[i] <= 104`,
    hints: [
      "Use two pointers at the beginning and end.",
      "Calculate area with current pointers.",
      "Move the pointer with smaller height inward.",
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["Array", "Two Pointers", "Greedy"],
    companies: ["Facebook", "Amazon", "Bloomberg", "Adobe"],
    followUp: "Can you solve this in O(n) time and O(1) space?",
  },
  {
    id: 13,
    title: "3Sum",
    difficulty: "Medium",
    category: "Two Pointers",
    leetcodeUrl: "https://leetcode.com/problems/3sum/",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    detailedDescription: `Example 1:
    Input: nums = [-1,0,1,2,-1,-4]
    Output: [[-1,-1,2],[-1,0,1]]
    Explanation: The solution set is [[-1,-1,2],[-1,0,1]].

    Example 2:
    Input: nums = []
    Output: []
    Explanation: The solution set is [].

    Example 3:
    Input: nums = [0]
    Output: []
    Explanation: The solution set is [].`,
    hints: [
      "Sort the array first.",
      "Use a fixed pointer and a two-pointer approach.",
      "Skip duplicates to avoid duplicate triplets.",
    ],
    timeComplexity: "O(n^2)",
    spaceComplexity: "O(1)",
    tags: ["Array", "Two Pointers"],
    companies: ["Amazon", "Microsoft", "Facebook", "Apple"],
    followUp: "Can you solve this problem in O(n^2) time?",
  },
  {
    id: 14,
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Two Pointers",
    leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
    description: "Given n non-negative integers a1, a2, ..., an , where each represents a point at coordinate (i, ai). n vertical lines are drawn such that the two endpoints of line i is at (i, ai) and (i, 0). Find two lines, which together with the x-axis forms a container, such that the container contains the most water.",
    detailedDescription: `Example 1:
    Input: height = [1,8,6,2,5,4,8,3,7]
    Output: 49
    Explanation: The max area is between height[1] and height[8]: 7 * (8 - 1) = 49.

    Example 2:
    Input: height = [1,1]
    Output: 1
    Explanation: The max area is 1 * (1 - 0) = 1.

    Constraints:
    • n == height.length
    • 2 <= n <= 105
    • 0 <= height[i] <= 104`,
    hints: [
      "Use two pointers at the beginning and end.",
      "Calculate area with current pointers.",
      "Move the pointer with smaller height inward.",
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["Array", "Two Pointers", "Greedy"],
    companies: ["Facebook", "Amazon", "Bloomberg", "Adobe"],
    followUp: "Can you solve this in O(n) time and O(1) space?",
  },
  {
    id: 15,
    title: "3Sum Closest",
    difficulty: "Medium",
    category: "Two Pointers",
    leetcodeUrl: "https://leetcode.com/problems/3sum-closest/",
    description: "Given an integer array nums of length n and an integer target, find three integers in nums such that the sum is closest to target. Return the sum of the three integers.",
    detailedDescription: `Example 1:
    Input: nums = [-1,2,1,-4], target = 1
    Output: 2
    Explanation: The sum that is closest to the target is 2 (-1 + 2 + 1 = 2).

    Example 2:
    Input: nums = [0,0,0], target = 1
    Output: 0
    Explanation: The sum that is closest to the target is 0 (0 + 0 + 0 = 0).`,
    hints: [
      "Sort the array first.",
      "Use a fixed pointer and a two-pointer approach.",
      "Keep track of the closest sum found so far.",
    ],
    timeComplexity: "O(n^2)",
    spaceComplexity: "O(1)",
    tags: ["Array", "Two Pointers"],
    companies: ["Amazon", "Microsoft", "Facebook", "Apple"],
    followUp: "Can you solve this problem in O(n^2) time?",
  },
  {
    id: 16,
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    detailedDescription: `Example 1:
    Input: s = "()"
    Output: true

    Example 2:
    Input: s = "()[]{}"
    Output: true

    Example 3:
    Input: s = "(]"
    Output: false`,
    hints: [
      "Use a stack to keep track of opening brackets.",
      "Pop from the stack when you encounter a closing bracket.",
      "Check if the popped bracket matches the current closing bracket.",
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    tags: ["Stack"],
    companies: ["Amazon", "Microsoft", "Facebook", "Apple"],
    followUp: "Can you solve this problem in O(n) time?",  
  },
  {
    id: 17,
    title: "Merge Intervals",
    difficulty: "Medium",
    category: "Intervals",
    leetcodeUrl: "https://leetcode.com/problems/merge-intervals/",
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    detailedDescription: `Example 1:
    Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
    Output: [[1,6],[8,10],[15,18]]
    Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].

    Example 2:
    Input: intervals = [[1,4],[4,5]]
    Output: [[1,5]]
    Explanation: Intervals [1,4] and [4,5] are considered overlapping.`,
    hints: [
      "Sort the intervals by their start time.",
      "Use a stack to keep track of merged intervals.",
      "If the current interval overlaps with the top of the stack, merge them.",
    ],
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    tags: ["Array", "Sorting", "Intervals"],
    companies: ["Google", "Facebook", "Amazon", "Microsoft"],
    followUp: "Can you solve this problem in O(n) time?",
  },
  {
    id: 18,
    title: "Insert Interval",
    difficulty: "Medium",
    category: "Intervals",
    leetcodeUrl: "https://leetcode.com/problems/insert-interval/",
    description: "Given a set of non-overlapping intervals, insert a new interval into the intervals (merge if necessary).",
    detailedDescription: `Example 1:
    Input: intervals = [[1,3],[6,9]], newInterval = [2,5]
    Output: [[1,5],[6,9]]
    Explanation: Since intervals [1,3] and [6,9] do not overlap with [2,5], we simply insert the new interval.

    Example 2:
    Input: intervals = [[1,5]], newInterval = [2,3]
    Output: [[1,5]]
    Explanation: The new interval [2,3] overlaps with [1,5], so we merge them into [1,5].`,
    hints: [
      "Use a list to store the merged intervals.",
      "Iterate through the existing intervals and merge them with the new interval if they overlap.",
      "Make sure to handle cases where the new interval is added at the beginning or end.",
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    tags: ["Array", "Sorting", "Intervals"],
    companies: ["Google", "Facebook", "Amazon", "Microsoft"],
    followUp: "Can you solve this problem in O(n) time?",
  },
  {
    id: 19,
    title: "Find First and Last Position of Element in Sorted Array",
    difficulty: "Medium",
    category: "Binary Search",
    leetcodeUrl: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
    description: "Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.",
    detailedDescription: `Example 1:
    Input: nums = [5,7,7,8,8,10], target = 8
    Output: [3,4]

    Example 2:
    Input: nums = [5,7,7,8,8,10], target = 6
    Output: [-1,-1]`,
    hints: [
      "Use binary search to find the target.",
      "Once found, expand the search to find the first and last positions.",
      "Consider edge cases where the target is not present.",
    ],
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    tags: ["Array", "Binary Search"],
    companies: ["Google", "Facebook", "Amazon", "Microsoft"],
    followUp: "Can you solve this problem in O(log n) time?",
  },
  {
    id: 20,
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    category: "Binary Search",
    leetcodeUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    description: "Given the array nums, which is sorted and then rotated at an unknown pivot, and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
    detailedDescription: `Example 1:
    Input: nums = [4,5,6,7,0,1,2], target = 0
    Output: 4

    Example 2:
    Input: nums = [4,5,6,7,0,1,2], target = 3
    Output: -1`,
    hints: [
      "Consider using binary search.",
      "Identify the pivot point where the array is rotated.",
      "Search in the appropriate half of the array based on the pivot.",
    ],
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    tags: ["Array", "Binary Search"],
    companies: ["Google", "Facebook", "Amazon", "Microsoft"],
    followUp: "Can you solve this problem in O(log n) time?",
  },
  {
    id: 21,
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "Medium",
    category: "Binary Search",
    leetcodeUrl: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    description: "Suppose an array sorted in ascending order is rotated at some pivot unknown to you beforehand. Find the minimum element.",
    detailedDescription: `Example 1:
    Input: nums = [3,4,5,1,2]
    Output: 1

    Example 2:
    Input: nums = [4,5,6,7,0,1,2]
    Output: 0`,
    hints: [
      "Use binary search to find the pivot.",
      "The minimum element is at the pivot point.",
      "Consider edge cases where the array is not rotated.",
    ],
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    tags: ["Array", "Binary Search"],
    companies: ["Google", "Facebook", "Amazon", "Microsoft"],
    followUp: "Can you solve this problem in O(log n) time?",
  },
  {
    id: 22,
    title: "Find Peak Element",
    difficulty: "Medium",
    category: "Binary Search",
    leetcodeUrl: "https://leetcode.com/problems/find-peak-element/",
    description: "A peak element in an array is an element that is strictly greater than its neighbors.",
    detailedDescription: `Example 1:
    Input: nums = [1,2,3,1]
    Output: 2

    Example 2:
    Input: nums = [1,2,1,3,5,6,4]
    Output: 5`,
    hints: [
      "Use binary search to find the peak.",
      "Consider the properties of the peak element.",
      "You can find a peak in O(log n) time.",
    ],
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    tags: ["Array", "Binary Search"],
    companies: ["Google", "Facebook", "Amazon", "Microsoft"],
    followUp: "Can you solve this problem in O(log n) time?",
  },
  

];

export const categories = [
  "All",
  "Array & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Heap/Priority Queue",
  "Backtracking",
  "Graphs",
  "Advanced Graphs",
  "1-D DP",
  "2-D DP",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
];

export const getDifficultyColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "#22C55E";
    case "medium":
      return "#F59E0B";
    case "hard":
      return "#EF4444";
    default:
      return "#6B7280";
  }
};
