class UserMatchingJob < ApplicationJob
  queue_as :default

  def perform(*args)
    users = User.all
    return 0 if users.count < 2

    user_groups = users.shuffle.in_groups_of(2)

    merge_single_user_group(user_groups) if user_groups.last.last.nil?

    matches = user_groups.map do |user_group|
      match = Match.create!(date: DateTime.now)
      match.create_user_matches(user_group)

      match
    end

    matches.size
  end

  private

  def merge_single_user_group(user_groups)
      last_group = user_groups.pop
      user_groups.last << last_group.first
  end
end
