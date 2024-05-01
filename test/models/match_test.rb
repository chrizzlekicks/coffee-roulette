# frozen_string_literal: true

require "test_helper"

class MatchTest < ActiveSupport::TestCase
  test 'does not create a match without a date' do
    match = Match.new

    assert_not match.valid?
    assert_raise ActiveRecord::RecordInvalid do
      match.save!
    end
  end

  test 'creates a match when we pass some date' do
    match = Match.new(date: DateTime.now)

    assert match.valid?
    assert match.save!
    assert_equal 1, Match.all.count
  end

  test 'creates two user matches when we create a match' do
    stub_multiple_users 2

    match = Match.create!(date: DateTime.now)

    match.create_user_matches(User.all)

    assert_equal 2, match.user_matches.count
    assert_equal 2, match.users.count
  end

  test 'sends out regular mails for every user in the user group' do
    stub_multiple_users 2
  
    match = Match.create!(date: DateTime.now)
  
    assert_emails 2 do
      match.create_user_matches(User.all)
    end
  end

  test 'sends out 3 mails for three users' do
    stub_multiple_users 3
  
    match = Match.create!(date: DateTime.now)
  
    assert_emails 3 do
      match.create_user_matches(User.all)
    end
  end
end
