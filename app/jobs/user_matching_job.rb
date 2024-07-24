# frozen_string_literal: true

class UserMatchingJob < ApplicationJob
  queue_as :default

  def perform(*_args)
    users = User.active
    return 0 if users.count < 2

    user_groups = users.shuffle.in_groups_of(2)

    merge_single_user_group(user_groups) if user_groups.last.last.nil?

    create_match_per_user_group(user_groups).size
  end

  private

  def merge_single_user_group(user_groups)
    last_group = user_groups.pop
    user_groups.last << last_group.first
  end

  def create_match_per_user_group(user_groups)
    user_groups.map do |user_group|
      Match.create!(date: DateTime.now).create_user_matches(user_group)
    end
  end
end
