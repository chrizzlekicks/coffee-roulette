class UserMatch < ApplicationRecord
  belongs_to :user
  belongs_to :match

  validates :match_id, presence: true
  validates :user_id, presence: true

  validates_associated :match
  validates_associated :user
end
