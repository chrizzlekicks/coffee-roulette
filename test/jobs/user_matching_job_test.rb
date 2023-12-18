require "test_helper"

class UserMatchingJobTest < ActiveJob::TestCase
  setup do
    @job = UserMatchingJob.new
  end

  test 'does nothing when there are no users' do
    @job.perform_now

    assert_empty UserMatch.all
  end

  test 'does nothing when there is only one user' do
    User.create!(name: 'test', email: 'test@test.de')

    @job.perform_now

    assert_empty UserMatch.all
  end

  test 'creates match when there are at least 2 users' do
    2.times { |i| User.create!(name: "test#{i}", email: "test#{i}@test.de") }

    assert_equal 2, @job.perform_now
    assert_equal 1, Match.count
    assert_equal 2, UserMatch.count
  end
end
