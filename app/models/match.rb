class Match < ApplicationRecord
  has_many :user_matches, validate: true
  has_many :users, through: :user_matches

  validates :date, presence: true
  
  def create_user_matches(users)
    users.map do |user|
      UserMatch.create!(match: self, user: user)
      MatchMailer.with(user: user, matched_users: users - [user]).matched.deliver_now
    end
  end
end