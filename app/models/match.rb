class Match < ApplicationRecord
  has_many :user_matches
  has_many :users, through: :user_matches
  
  def create_user_matches(users)
    users.map do |user|
      UserMatch.create!(match: self, user: user)
    end
  end
end