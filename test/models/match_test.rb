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
    2.times { |i| User.create!(email: "user#{i}@test.de", username: "user#{i}", password: "random") }

    match = Match.create!(date: DateTime.now)

    match.create_user_matches(User.all)

    assert_equal 2, match.user_matches.count
    assert_equal 2, match.users.count
  end
end
