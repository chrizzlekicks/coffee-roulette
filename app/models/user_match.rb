class UserMatch < ApplicationRecord
  belongs_to :user
  belongs_to :match

  validates :match, presence: true
  validates :user, presence: true

  validates_associated :match
  validates_associated :user
end
