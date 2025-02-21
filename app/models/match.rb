# frozen_string_literal: true

class Match < ApplicationRecord
  has_many :user_matches, validate: true
  has_many :users, through: :user_matches

  validates :date, presence: true

  def create_user_matches(users)
    users.map do |user|
      UserMatch.create!(match: self, user:)
      MatchMailer.with(user:, matched_users: users - [user]).matched.deliver_now
    end
  end
end

# select A.match_id, B.user_id, email, date
# from user_matches A
# join user_matches B on A.match_id = B.match_id
# join users on B.user_id = users.id
# join matches on A.match_id = matches.id
# where A.user_id = '57ebe8c5-f61b-4d1c-93c2-898fe1260ab9';

# UserMatch.find_by(user_id: user_id).match.users.where.not(id: user_id)
