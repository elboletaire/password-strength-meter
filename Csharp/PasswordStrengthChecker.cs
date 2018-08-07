using System;
using System.Text.RegularExpressions;

namespace Utility
{
    public class PasswordStrengthChecker
    {
        private readonly PasswordStrengthConfigs _options;

        /// <summary>
        /// Initialize Password StrengthChecker With Default Values
        /// </summary>
        public PasswordStrengthChecker()
        {
            //Defaults
            _options = new PasswordStrengthConfigs
            {
                ShortPass = "The password is too short",
                BadPass = "Weak; try combining letters & numbers",
                GoodPass = "Medium; try using special characters",
                StrongPass = "Strong password",
                ContainsUsername = "The password contains the username",
                //EnterPass = "Type your password",
                //ShowPercent = false,
                //ShowText = true,
                //Animate = true,
                //AnimateSpeed = "fast",
                Username = false,
                UsernamePartialMatch = true,
                MinimumLength = 4
            };
        }

        /// <summary>
        /// Initialize Password StrengthChecker With Custom Values
        /// </summary>
        /// <param name="options"></param>
        public PasswordStrengthChecker(PasswordStrengthConfigs options)
        {
            _options = options;
        }

        /// <summary>
        /// Returns strings based on the score given.
        /// </summary>
        /// <param name="score">int - Score base.</param>
        /// <returns>string</returns>
        public string ScoreText(int score)
        {
            if (score == -1)
            {
                return _options.ShortPass;
            }
            if (score == -2)
            {
                return _options.ContainsUsername;
            }

            score = score < 0 ? 0 : score;

            if (score < 34)
            {
                return _options.BadPass;
            }
            if (score < 68)
            {
                return _options.GoodPass;
            }

            return _options.StrongPass;
        }

        /// <summary>
        /// Returns a value between -2 and 100 to score the user's password.
        /// </summary>
        /// <param name="password">string - The password to be checked.</param>
        /// <param name="username">string - The username set (if options.username).</param>
        /// <returns>int</returns>
        private int CalculateScore(string password, string username)
        {
            var score = 0;

            // password < options.minimumLength
            if (password.Length < _options.MinimumLength)
            {
                return -1;
            }

            if (_options.Username)
            {
                // password === username
                if (String.Equals(password, username, StringComparison.CurrentCulture))
                {
                    return -2;
                }
                // password contains username (and usernamePartialMatch is set to true)
                if (_options.UsernamePartialMatch && username.Length > 0)
                {
                    var user = new Regex(username.ToLower());
                    if (user.IsMatch(password.ToLower()))
                    {
                        return -2;
                    }
                }
            }

            // password length
            score += password.Length * 4;
            score += CheckRepetition(1, password).Length - password.Length;
            score += CheckRepetition(2, password).Length - password.Length;
            score += CheckRepetition(3, password).Length - password.Length;
            score += CheckRepetition(4, password).Length - password.Length;

            // password has 3 numbers
            if (Regex.IsMatch(password, @"(.*[0-9].*[0-9].*[0-9])"))
            {
                score += 5;
            }

            // password has at least 2 symbols
            var symbols = ".*[!,@,#,$,%,^,&,*,?,_,~]";
            var symbolsRegex = new Regex('(' + symbols + symbols + ')');
            if (symbolsRegex.IsMatch(password))
            {
                score += 5;
            }

            // password has Upper and Lower chars
            if (Regex.IsMatch(password, @"([a-z].*[A-Z])|([A-Z].*[a-z])"))
            {
                score += 10;
            }

            // password has number and chars
            if (Regex.IsMatch(password, @"([a-zA-Z])") && Regex.IsMatch(password, @"([0-9])"))
            {
                score += 15;
            }

            // password has number and symbol
            if (Regex.IsMatch(password, @"([!,@,#,$,%,^,&,*,?,_,~])") && Regex.IsMatch(password, @"([0-9])"))
            {
                score += 15;
            }

            // password has char and symbol
            if (Regex.IsMatch(password, @"([!,@,#,$,%,^,&,*,?,_,~])") && Regex.IsMatch(password, @"([a-zA-Z])"))
            {
                score += 15;
            }

            // password is just numbers or chars
            if (Regex.IsMatch(password, @"^\w+$") || Regex.IsMatch(password, @"^\d+$"))
            {
                score -= 10;
            }

            if (score > 100)
            {
                score = 100;
            }

            if (score < 0)
            {
                score = 0;
            }

            return score;
        }

        /// <summary>
        /// Checks for repetition of characters in a string
        /// </summary>
        /// <param name="rLen">int - Repetition length.</param>
        /// <param name="str">string - The string to be checked.</param>
        /// <returns>string</returns>
        private string CheckRepetition(int rLen, string str)
        {
            string res = "";
            for (var i = 0; i < str.Length; i++)
            {
                var repeated = true;
                int j;
                for (j = 0; j < rLen && (j + i + rLen) < str.Length; j++)
                {
                    repeated = repeated && (str[j + i] == str[j + i + rLen]);
                }
                if (j < rLen)
                {
                    repeated = false;
                }

                if (repeated)
                {
                    i += rLen - 1;
                    //repeated = false;
                }
                else
                {
                    res += str[i];
                }
            }
            return res;
        }

        public class PasswordStrengthConfigs
        {
            public string ShortPass { get; set; }
            public string BadPass { get; set; }
            public string GoodPass { get; set; }
            public string StrongPass { get; set; }
            public string ContainsUsername { get; set; }
            //public string EnterPass { get; set; }
            //public bool ShowPercent { get; set; }
            //public bool ShowText { get; set; }
            //public bool Animate { get; set; }
            //public string AnimateSpeed { get; set; }
            public bool Username { get; set; }
            public bool UsernamePartialMatch { get; set; }
            public int MinimumLength { get; set; }
        }
    }
}
