class UserMatchingJob < ApplicationJob
  queue_as :default

  def perform(*args)
    users = User.all
    return if users.count < 2

    match = Match.create!(date: DateTime.now)

    user_matches = match.create_user_matches(users)

    user_matches.length
  end
end
